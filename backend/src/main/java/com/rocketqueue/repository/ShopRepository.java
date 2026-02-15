package com.rocketqueue.repository;

import com.rocketqueue.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, String> {
    List<Shop> findByVendorId(String vendorId);
    List<Shop> findByCategory(String category);
}
