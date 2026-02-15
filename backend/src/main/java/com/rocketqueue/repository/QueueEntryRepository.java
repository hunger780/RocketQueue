package com.rocketqueue.repository;

import com.rocketqueue.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, String> {
    List<QueueEntry> findByQueueEntityId(String queueId);
    List<QueueEntry> findByUserId(String userId);
}
