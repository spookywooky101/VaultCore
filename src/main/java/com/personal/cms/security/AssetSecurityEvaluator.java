package com.personal.cms.security;

import com.personal.cms.model.Asset;
import com.personal.cms.repository.AssetRepository;
import com.personal.cms.repository.AssetShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("assetSecurity")
public class AssetSecurityEvaluator {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetShareRepository assetShareRepository;

    private String getCurrentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public boolean isOwner(Long assetId) {
        String username = getCurrentUsername();
        if (username == null || assetId == null) {
            return false;
        }
        Asset asset = assetRepository.findById(assetId).orElse(null);
        return asset != null && username.equalsIgnoreCase(asset.getUploadedBy());
    }

    public boolean canRead(Long assetId) {
        String username = getCurrentUsername();
        if (username == null || assetId == null) {
            return false;
        }
        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            return false;
        }
        // Owner has absolute read access
        if (username.equalsIgnoreCase(asset.getUploadedBy())) {
            return true;
        }
        // Check if shared with this user as READER or EDITOR
        return assetShareRepository.existsByAssetIdAndSharedWith(assetId, username);
    }

    public boolean canWrite(Long assetId) {
        String username = getCurrentUsername();
        if (username == null || assetId == null) {
            return false;
        }
        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) {
            return false;
        }
        // Owner has absolute write access
        if (username.equalsIgnoreCase(asset.getUploadedBy())) {
            return true;
        }
        // Check if shared with this user as EDITOR
        return assetShareRepository.existsByAssetIdAndSharedWithAndRole(assetId, username, "EDITOR");
    }
}
