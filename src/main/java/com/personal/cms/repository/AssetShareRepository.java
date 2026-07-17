package com.personal.cms.repository;

import com.personal.cms.model.AssetShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetShareRepository extends JpaRepository<AssetShare, Long> {
    List<AssetShare> findByAssetId(Long assetId);
    
    boolean existsByAssetIdAndSharedWith(Long assetId, String sharedWith);
    
    boolean existsByAssetIdAndSharedWithAndRole(Long assetId, String sharedWith, String role);
    
    void deleteByAssetId(Long assetId);
}
