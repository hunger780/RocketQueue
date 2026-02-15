package com.rocketqueue.repository;

import com.rocketqueue.entity.ServiceLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceLineRepository extends JpaRepository<ServiceLine, String> {
    List<ServiceLine> findByShopId(String shopId);
}
