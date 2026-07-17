package com.personal.cms.controller;

import com.personal.cms.model.Asset;
import com.personal.cms.model.AssetShare;
import com.personal.cms.repository.AssetRepository;
import com.personal.cms.repository.AssetShareRepository;
import com.personal.cms.service.CloudinaryStorageService;
import com.personal.cms.service.FileStorageService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private CloudinaryStorageService cloudinaryStorageService;

    @Autowired
    private FileStorageService fileStorageService; // kept for compress/extract operations

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetShareRepository assetShareRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAsset(@RequestParam("file") MultipartFile file,
                                         @RequestParam(value = "description", required = false) String description,
                                         @RequestParam(value = "tags", required = false) String tags) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Upload to Cloudinary cloud storage
        Map<String, String> cloudResult = cloudinaryStorageService.uploadFile(file);
        String secureUrl = cloudResult.get("secure_url");
        String publicId  = cloudResult.get("public_id");

        Asset asset = Asset.builder()
                .name(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(secureUrl)       // store the Cloudinary HTTPS URL
                .cloudPublicId(publicId)      // store public_id for future deletion
                .description(description)
                .tags(tags)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(username)
                .build();

        Asset savedAsset = assetRepository.save(asset);
        return ResponseEntity.ok(savedAsset);
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Asset> assets = assetRepository.findAllOwnedOrShared(username);
        for (Asset asset : assets) {
            if (asset.getUploadedBy().equalsIgnoreCase(username)) {
                asset.setSharedRole("OWNER");
            } else {
                List<AssetShare> shares = assetShareRepository.findByAssetId(asset.getId());
                String role = shares.stream()
                        .filter(s -> s.getSharedWith().equalsIgnoreCase(username))
                        .map(AssetShare::getRole)
                        .findFirst()
                        .orElse("READER");
                asset.setSharedRole(role);
            }
        }
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@assetSecurity.canRead(#id)")
    public ResponseEntity<?> getAssetById(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
        return ResponseEntity.ok(asset);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("@assetSecurity.canRead(#id)")
    public ResponseEntity<?> downloadAssetFile(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        String storagePath = asset.getStoragePath();

        // If stored as a Cloudinary URL, redirect the browser directly to it
        if (storagePath != null && storagePath.startsWith("http")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(storagePath))
                    .build();
        }

        // Fallback: serve from local disk (legacy files uploaded before Cloudinary)
        Resource resource = fileStorageService.loadFileAsResource(storagePath);
        String contentType = asset.getFileType() != null ? asset.getFileType() : "application/octet-stream";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + asset.getName() + "\"")
                .body(resource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@assetSecurity.canWrite(#id)")
    public ResponseEntity<?> updateAssetMetadata(@PathVariable Long id, @RequestBody AssetUpdateRequest updateRequest) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        if (updateRequest.getName() != null) {
            asset.setName(updateRequest.getName());
        }
        if (updateRequest.getDescription() != null) {
            asset.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getTags() != null) {
            asset.setTags(updateRequest.getTags());
        }

        Asset updatedAsset = assetRepository.save(asset);
        return ResponseEntity.ok(updatedAsset);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@assetSecurity.isOwner(#id)")
    @Transactional
    public ResponseEntity<?> deleteAsset(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        // Delete any share records first to avoid foreign key violations
        assetShareRepository.deleteByAssetId(id);

        // Delete from Cloudinary cloud storage
        if (asset.getCloudPublicId() != null) {
            cloudinaryStorageService.deleteFile(asset.getCloudPublicId());
        } else if (asset.getStoragePath() != null && !asset.getStoragePath().startsWith("http")) {
            // Legacy local file fallback
            fileStorageService.deleteFile(asset.getStoragePath());
        }

        // Delete database record
        assetRepository.delete(asset);

        return ResponseEntity.ok(Map.of("message", "Asset deleted successfully!"));
    }

    @PostMapping("/{id}/compress")
    @PreAuthorize("@assetSecurity.canWrite(#id)")
    public ResponseEntity<?> compressAsset(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        if (asset.getStoragePath() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot compress an asset without a stored file."));
        }

        try {
            // Step 1: Download file bytes from Cloudinary (or local fallback)
            byte[] fileBytes;
            if (asset.getStoragePath().startsWith("http")) {
                fileBytes = cloudinaryStorageService.downloadFileAsBytes(asset.getStoragePath());
            } else {
                Resource res = fileStorageService.loadFileAsResource(asset.getStoragePath());
                fileBytes = res.getInputStream().readAllBytes();
            }

            // Step 2: Compress bytes into a ZIP in-memory
            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(bos)) {
                java.util.zip.ZipEntry entry = new java.util.zip.ZipEntry(asset.getName());
                zos.putNextEntry(entry);
                zos.write(fileBytes);
                zos.closeEntry();
            }
            byte[] zipBytes = bos.toByteArray();

            // Step 3: Upload the ZIP bytes to Cloudinary
            String zipFileName = asset.getName() + ".zip";
            Map<String, String> cloudResult = cloudinaryStorageService.uploadBytes(zipBytes, zipFileName);
            String secureUrl = cloudResult.get("secure_url");
            String publicId  = cloudResult.get("public_id");

            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            Asset zipAsset = Asset.builder()
                    .name(zipFileName)
                    .fileType("application/zip")
                    .fileSize((long) zipBytes.length)
                    .storagePath(secureUrl)
                    .cloudPublicId(publicId)
                    .description("Compressed archive of " + asset.getName())
                    .tags(asset.getTags() != null ? asset.getTags() + ",zip" : "zip")
                    .uploadedAt(LocalDateTime.now())
                    .uploadedBy(username)
                    .build();

            Asset savedZipAsset = assetRepository.save(zipAsset);
            return ResponseEntity.ok(savedZipAsset);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Compression failed: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/extract")
    @PreAuthorize("@assetSecurity.canWrite(#id)")
    public ResponseEntity<?> extractZipAsset(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        if (asset.getStoragePath() == null || !"application/zip".equalsIgnoreCase(asset.getFileType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Asset is not a zip file or has no stored file."));
        }

        try {
            // Step 1: Download zip bytes from Cloudinary (or local fallback)
            byte[] zipBytes;
            if (asset.getStoragePath().startsWith("http")) {
                zipBytes = cloudinaryStorageService.downloadFileAsBytes(asset.getStoragePath());
            } else {
                Resource res = fileStorageService.loadFileAsResource(asset.getStoragePath());
                zipBytes = res.getInputStream().readAllBytes();
            }

            // Step 2: Extract entries from the ZIP in-memory
            List<Asset> createdAssets = new ArrayList<>();
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            try (java.util.zip.ZipInputStream zis =
                         new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(zipBytes))) {

                java.util.zip.ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.isDirectory()) { zis.closeEntry(); continue; }

                    String entryName = new java.io.File(entry.getName()).getName();
                    byte[] entryBytes = zis.readAllBytes();
                    zis.closeEntry();

                    // Step 3: Upload each extracted file to Cloudinary
                    Map<String, String> cloudResult = cloudinaryStorageService.uploadBytes(entryBytes, entryName);
                    String secureUrl = cloudResult.get("secure_url");
                    String publicId  = cloudResult.get("public_id");

                    // Detect content type from extension
                    String fileType = java.nio.file.Files.probeContentType(java.nio.file.Path.of(entryName));
                    if (fileType == null) fileType = "application/octet-stream";

                    Asset newAsset = Asset.builder()
                            .name(entryName)
                            .fileType(fileType)
                            .fileSize((long) entryBytes.length)
                            .storagePath(secureUrl)
                            .cloudPublicId(publicId)
                            .description("Extracted from zip: " + asset.getName())
                            .tags(asset.getTags())
                            .uploadedAt(LocalDateTime.now())
                            .uploadedBy(username)
                            .build();
                    createdAssets.add(assetRepository.save(newAsset));
                }
            }

            return ResponseEntity.ok(createdAssets);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Extraction failed: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/share")
    @PreAuthorize("@assetSecurity.isOwner(#id)")
    public ResponseEntity<?> shareAsset(@PathVariable Long id, @RequestBody ShareRequest shareRequest) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        String recipient = shareRequest.getUsername();
        String role = shareRequest.getRole().toUpperCase();

        if (!"READER".equals(role) && !"EDITOR".equals(role)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role! Allowed values: READER, EDITOR"));
        }

        // Verify if share already exists
        List<AssetShare> shares = assetShareRepository.findByAssetId(id);
        AssetShare existingShare = shares.stream()
                .filter(s -> s.getSharedWith().equalsIgnoreCase(recipient))
                .findFirst()
                .orElse(null);

        if (existingShare != null) {
            existingShare.setRole(role);
            assetShareRepository.save(existingShare);
            return ResponseEntity.ok(Map.of("message", "Share permissions updated successfully!"));
        }

        AssetShare share = new AssetShare();
        share.setAsset(asset);
        share.setSharedWith(recipient);
        share.setRole(role);
        assetShareRepository.save(share);

        return ResponseEntity.ok(Map.of("message", "Asset shared successfully with " + recipient));
    }

    @GetMapping("/{id}/shares")
    @PreAuthorize("@assetSecurity.isOwner(#id)")
    public ResponseEntity<?> getAssetShares(@PathVariable Long id) {
        assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));

        List<AssetShare> shares = assetShareRepository.findByAssetId(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (AssetShare s : shares) {
            result.add(Map.of(
                    "id", s.getId(),
                    "sharedWith", s.getSharedWith(),
                    "role", s.getRole()
            ));
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}/share/{shareId}")
    @PreAuthorize("@assetSecurity.isOwner(#id)")
    public ResponseEntity<?> deleteAssetShare(@PathVariable Long id, @PathVariable Long shareId) {
        AssetShare share = assetShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Share permission not found"));

        if (!share.getAsset().getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid share reference"));
        }

        assetShareRepository.delete(share);
        return ResponseEntity.ok(Map.of("message", "Access revoked successfully!"));
    }

    @Data
    public static class ShareRequest {
        private String username;
        private String role;
    }

    @Data
    public static class AssetUpdateRequest {
        private String name;
        private String description;
        private String tags;
    }
}
