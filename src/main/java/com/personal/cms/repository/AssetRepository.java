package com.personal.cms.repository;

import com.personal.cms.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT a FROM Asset a LEFT JOIN AssetShare s ON s.asset.id = a.id WHERE LOWER(a.uploadedBy) = LOWER(:username) OR LOWER(s.sharedWith) = LOWER(:username)")
    List<Asset> findAllOwnedOrShared(@org.springframework.data.repository.query.Param("username") String username);
}
