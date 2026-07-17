package com.personal.cms.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * CloudinaryStorageService handles uploading and deleting files from Cloudinary cloud storage.
 * Files are stored using resource_type=auto so Cloudinary auto-detects images, videos, and raw files.
 */
@Service
public class CloudinaryStorageService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Uploads a file to Cloudinary.
     * Returns a map with keys: "public_id" and "secure_url".
     */
    public Map<String, String> uploadFile(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "resource_type", "auto",         // auto-detect images/videos/raw files
                    "folder", "valutcore/assets"      // organise in Cloudinary folder
                )
            );

            String publicId  = (String) result.get("public_id");
            String secureUrl = (String) result.get("secure_url");

            return Map.of("public_id", publicId, "secure_url", secureUrl);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads raw bytes to Cloudinary (used for compressed/extracted files).
     */
    public Map<String, String> uploadBytes(byte[] bytes, String filename) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                bytes,
                ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", "valutcore/assets",
                    "public_id", "valutcore/assets/" + filename
                )
            );

            String publicId  = (String) result.get("public_id");
            String secureUrl = (String) result.get("secure_url");

            return Map.of("public_id", publicId, "secure_url", secureUrl);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload bytes to Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a profile picture to Cloudinary under the "valutcore/profiles" folder.
     */
    public Map<String, String> uploadProfilePicture(MultipartFile file, String username) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", "valutcore/profiles",
                    "public_id", "valutcore/profiles/" + username,
                    "overwrite", true,
                    "transformation", ObjectUtils.asMap("width", 200, "height", 200, "crop", "fill")
                )
            );

            String publicId  = (String) result.get("public_id");
            String secureUrl = (String) result.get("secure_url");

            return Map.of("public_id", publicId, "secure_url", secureUrl);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile picture to Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Downloads the raw bytes of a file from any public URL (e.g., a Cloudinary secure URL).
     * Used by compress and extract operations that need the file bytes in memory.
     */
    public byte[] downloadFileAsBytes(String url) {
        try {
            java.net.URL fileUrl = new java.net.URI(url).toURL();
            try (java.io.InputStream in = fileUrl.openStream()) {
                return in.readAllBytes();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from URL: " + url + " — " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a file from Cloudinary using its public_id.
     */
    public void deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "raw"));
        } catch (IOException e) {
            // Best-effort deletion; log but don't crash if Cloudinary delete fails
            System.err.println("Warning: Could not delete Cloudinary file with public_id: " + publicId + " — " + e.getMessage());
        }
    }
}
