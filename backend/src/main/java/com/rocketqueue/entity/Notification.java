package com.rocketqueue.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Notification {
    @Id
    private String id;
    private String userId;
    private String message;
    private Long timestamp;
    private boolean isRead;
}
