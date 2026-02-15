package com.rocketqueue.repository;

import com.rocketqueue.entity.QueueEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueRepository extends JpaRepository<QueueEntity, String> {
    List<QueueEntity> findByShopId(String shopId);
}
