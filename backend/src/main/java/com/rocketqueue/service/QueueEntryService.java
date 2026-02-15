package com.rocketqueue.service;

import com.rocketqueue.entity.QueueEntry;
import com.rocketqueue.repository.QueueEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QueueEntryService {

    @Autowired
    private QueueEntryRepository queueEntryRepository;

    public List<QueueEntry> getAllQueueEntries() {
        return queueEntryRepository.findAll();
    }

    public List<QueueEntry> getEntriesByServiceLineId(String serviceLineId) {
        return queueEntryRepository.findByServiceLineId(serviceLineId);
    }

    public List<QueueEntry> getEntriesByUserId(String userId) {
        return queueEntryRepository.findByUserId(userId);
    }

    public Optional<QueueEntry> getQueueEntryById(String id) {
        return queueEntryRepository.findById(id);
    }

    public QueueEntry createQueueEntry(QueueEntry queueEntry) {
        return queueEntryRepository.save(queueEntry);
    }

    public QueueEntry updateQueueEntry(String id, QueueEntry entryDetails) {
        return queueEntryRepository.findById(id).map(entry -> {
            entry.setStatus(entryDetails.getStatus());
            entry.setEstimatedMinutes(entryDetails.getEstimatedMinutes());
            return queueEntryRepository.save(entry);
        }).orElse(null);
    }

    public void deleteQueueEntry(String id) {
        queueEntryRepository.deleteById(id);
    }
}
