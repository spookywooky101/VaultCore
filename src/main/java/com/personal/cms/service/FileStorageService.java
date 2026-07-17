package com.personal.cms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Stores a MultipartFile physically on disk.
     */
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence: " + originalFileName);
            }

            // Generate a unique filename to prevent overwrites
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    /**
     * Stores raw bytes as a file on disk (useful for compression / extraction).
     */
    public String storeFileFromBytes(String fileName, byte[] data) {
        try {
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.write(targetLocation, data);
            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file bytes " + fileName, ex);
        }
    }

    /**
     * Loads a file as a Resource for downloading.
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }

    /**
     * Deletes a file physically from disk.
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }

    /**
     * Compresses a file into a zip archive and stores it on disk.
     * Returns the name of the generated zip file.
     */
    public String compressFile(String fileName, String originalName) {
        Path sourcePath = this.fileStorageLocation.resolve(fileName).normalize();
        String zipName = originalName + ".zip";
        String uniqueZipName = UUID.randomUUID().toString() + "_" + zipName;
        Path zipPath = this.fileStorageLocation.resolve(uniqueZipName);

        try (FileOutputStream fos = new FileOutputStream(zipPath.toFile());
             ZipOutputStream zos = new ZipOutputStream(fos);
             FileInputStream fis = new FileInputStream(sourcePath.toFile())) {

            ZipEntry zipEntry = new ZipEntry(originalName);
            zos.putNextEntry(zipEntry);

            byte[] buffer = new byte[4096];
            int length;
            while ((length = fis.read(buffer)) >= 0) {
                zos.write(buffer, 0, length);
            }
            zos.closeEntry();
            return uniqueZipName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to compress file: " + originalName, ex);
        }
    }

    /**
     * Extracts a zip file and returns the details of all extracted files.
     */
    public List<ExtractedFileDetails> extractZip(String zipFileName) {
        Path zipPath = this.fileStorageLocation.resolve(zipFileName).normalize();
        List<ExtractedFileDetails> extractedFiles = new ArrayList<>();

        try (FileInputStream fis = new FileInputStream(zipPath.toFile());
             ZipInputStream zis = new ZipInputStream(fis)) {

            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    zis.closeEntry();
                    continue;
                }

                String entryName = entry.getName();
                // Avoid directory traversal attacks
                String baseEntryName = new File(entryName).getName();
                
                // Read entry bytes
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                byte[] buffer = new byte[4096];
                int len;
                long totalSize = 0;
                while ((len = zis.read(buffer)) > 0) {
                    bos.write(buffer, 0, len);
                    totalSize += len;
                }
                bos.close();

                // Store physically with a unique prefix
                String uniqueFileName = UUID.randomUUID().toString() + "_" + baseEntryName;
                Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
                Files.write(targetLocation, bos.toByteArray());

                // Detect simple content type extension
                String fileType = Files.probeContentType(targetLocation);
                if (fileType == null) {
                    fileType = "application/octet-stream";
                }

                extractedFiles.add(new ExtractedFileDetails(baseEntryName, uniqueFileName, fileType, totalSize));
                zis.closeEntry();
            }
        } catch (IOException ex) {
            throw new RuntimeException("Failed to extract zip file: " + zipFileName, ex);
        }

        return extractedFiles;
    }

    public static class ExtractedFileDetails {
        private final String originalName;
        private final String uniqueStorageName;
        private final String fileType;
        private final long fileSize;

        public ExtractedFileDetails(String originalName, String uniqueStorageName, String fileType, long fileSize) {
            this.originalName = originalName;
            this.uniqueStorageName = uniqueStorageName;
            this.fileType = fileType;
            this.fileSize = fileSize;
        }

        public String getOriginalName() { return originalName; }
        public String getUniqueStorageName() { return uniqueStorageName; }
        public String getFileType() { return fileType; }
        public long getFileSize() { return fileSize; }
    }
}
