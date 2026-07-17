package com.personal.cms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asset_shares")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "shared_with", nullable = false)
    private String sharedWith; // Username of the recipient

    @Column(name = "role", nullable = false)
    private String role; // "READER" or "EDITOR"
}
