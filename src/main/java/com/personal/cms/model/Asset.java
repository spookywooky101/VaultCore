package com.personal.cms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String fileType;

    private Long fileSize;

    private String storagePath; // Cloudinary secure URL (or local path for legacy assets)

    private String cloudPublicId; // Cloudinary public_id used for deletion

    @Column(length = 1000)
    private String description;

    private String tags; // Comma separated tags e.g., "bills,pdf,2026"

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Column(nullable = false)
    private String uploadedBy; // Username of the uploader

    @Transient
    private String sharedRole; // "OWNER", "READER", "EDITOR"
}
