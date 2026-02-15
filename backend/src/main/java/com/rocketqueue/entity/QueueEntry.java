package com.rocketqueue.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class QueueEntry {
    @Id
    private String id;
    private String userId;
    private String userName;
    private Long joinedAt;
    private String status; // Using String for simplicity, can be Enum
    private int estimatedMinutes;

    @ManyToOne
    @JoinColumn(name = "queue_id")
    private QueueEntity queueEntity;
}
