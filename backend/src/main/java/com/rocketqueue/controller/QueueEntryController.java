package com.rocketqueue.controller;

import com.rocketqueue.entity.QueueEntry;
import com.rocketqueue.service.QueueEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue-entries")
public class QueueEntryController {

    @Autowired
    private QueueEntryService queueEntryService;

    @GetMapping
    public List<QueueEntry> getAllQueueEntries() {
        return queueEntryService.getAllQueueEntries();
    }

    @GetMapping("/queue/{queueId}")
    public List<QueueEntry> getEntriesByQueueId(@PathVariable String queueId) {
        return queueEntryService.getEntriesByQueueId(queueId);
    }

    @GetMapping("/user/{userId}")
    public List<QueueEntry> getEntriesByUserId(@PathVariable String userId) {
        return queueEntryService.getEntriesByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueueEntry> getQueueEntryById(@PathVariable String id) {
        return queueEntryService.getQueueEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public QueueEntry createQueueEntry(@RequestBody QueueEntry queueEntry) {
        return queueEntryService.createQueueEntry(queueEntry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QueueEntry> updateQueueEntry(@PathVariable String id, @RequestBody QueueEntry entryDetails) {
        QueueEntry updatedEntry = queueEntryService.updateQueueEntry(id, entryDetails);
        if (updatedEntry != null) {
            return ResponseEntity.ok(updatedEntry);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQueueEntry(@PathVariable String id) {
        queueEntryService.deleteQueueEntry(id);
        return ResponseEntity.ok().build();
    }
}
