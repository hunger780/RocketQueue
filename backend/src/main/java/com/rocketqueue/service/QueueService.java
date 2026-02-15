package com.rocketqueue.service;

import com.rocketqueue.entity.QueueEntity;
import com.rocketqueue.repository.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QueueService {

    @Autowired
    private QueueRepository queueRepository;

    public List<QueueEntity> getAllQueues() {
        return queueRepository.findAll();
    }

    public List<QueueEntity> getQueuesByShopId(String shopId) {
        return queueRepository.findByShopId(shopId);
    }

    public Optional<QueueEntity> getQueueById(String id) {
        return queueRepository.findById(id);
    }

    public QueueEntity createQueue(QueueEntity queue) {
        return queueRepository.save(queue);
    }

    public QueueEntity updateQueue(String id, QueueEntity queueDetails) {
        return queueRepository.findById(id).map(queue -> {
            queue.setName(queueDetails.getName());
            queue.setActive(queueDetails.isActive());
            return queueRepository.save(queue);
        }).orElse(null);
    }

    public void deleteQueue(String id) {
        queueRepository.deleteById(id);
    }
}
