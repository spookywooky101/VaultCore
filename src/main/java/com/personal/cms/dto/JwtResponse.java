package com.personal.cms.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String role;
    private String profilePicturePath;
    private String animalAvatarType;

    public JwtResponse(String accessToken, Long id, String username, String role, String profilePicturePath, String animalAvatarType) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.role = role;
        this.profilePicturePath = profilePicturePath;
        this.animalAvatarType = animalAvatarType;
    }
}
