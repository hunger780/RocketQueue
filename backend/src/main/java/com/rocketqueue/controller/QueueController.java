package com.rocketqueue.controller;

import com.rocketqueue.entity.QueueEntity;
import com.rocketqueue.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queues")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @GetMapping
    public List<QueueEntity> getAllQueues() {
        return queueService.getAllQueues();
    }

    @GetMapping("/shop/{shopId}")
    public List<QueueEntity> getQueuesByShopId(@PathVariable String shopId) {
        return queueService.getQueuesByShopId(shopId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueueEntity> getQueueById(@PathVariable String id) {
        return queueService.getQueueById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public QueueEntity createQueue(@RequestBody QueueEntity queue) {
        return queueService.createQueue(queue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QueueEntity> updateQueue(@PathVariable String id, @RequestBody QueueEntity queueDetails) {
        QueueEntity updatedQueue = queueService.updateQueue(id, queueDetails);
        if (updatedQueue != null) {
            return ResponseEntity.ok(updatedQueue);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQueue(@PathVariable String id) {
        queueService.deleteQueue(id);
        return ResponseEntity.ok().build();
    }
}
