package com.personal.cms.controller;

import com.personal.cms.model.User;
import com.personal.cms.repository.UserRepository;
import com.personal.cms.service.CloudinaryStorageService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryStorageService cloudinaryStorageService;

    /**
     * Upload a custom profile picture — now stored on Cloudinary.
     * The secure HTTPS URL is saved directly in the database.
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty!"));
        }

        try {
            // Upload to Cloudinary — auto-crops to 200×200 square for profile pictures
            Map<String, String> result = cloudinaryStorageService.uploadProfilePicture(file, username);
            String secureUrl = result.get("secure_url");

            // Store the Cloudinary URL directly in the database
            user.setProfilePicturePath(secureUrl);
            user.setAnimalAvatarType(null); // clear cartoon avatar if switching to custom photo
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture uploaded successfully!",
                    "profilePicturePath", secureUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not upload to cloud: " + e.getMessage()));
        }
    }

    /**
     * Select a cartoon animal avatar preset.
     * Clears any custom profile picture path.
     */
    @PostMapping("/animal-avatar")
    public ResponseEntity<?> selectAnimalAvatar(@RequestBody AnimalAvatarRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String chosenAvatar = request.getAvatarType();
        user.setProfilePicturePath(null); // Clear custom photo to use cartoon instead
        user.setAnimalAvatarType(chosenAvatar);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Animal avatar updated to " + chosenAvatar,
                "animalAvatarType", chosenAvatar
        ));
    }

    @Data
    public static class AnimalAvatarRequest {
        private String avatarType;
    }
}
