package com.rocketqueue.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "queue")
public class QueueEntity {
    @Id
    private String id;
    private String name;
    private boolean isActive;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @OneToMany(mappedBy = "queueEntity", cascade = CascadeType.ALL)
    private List<QueueEntry> entries;
}
