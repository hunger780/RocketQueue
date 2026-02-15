package com.rocketqueue.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String customerId;

    private String shopId;

    private String serviceLineId;

    private String status; // 'confirmed', 'waiting', 'serving', 'completed', 'cancelled'

    private LocalDateTime appointmentTime;

    private LocalDateTime joinedAt;

    private Integer estimatedMinutes;
}
