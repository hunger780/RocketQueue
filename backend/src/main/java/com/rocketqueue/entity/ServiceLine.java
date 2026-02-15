package com.rocketqueue.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    @JsonIgnore
    private Shop shop;

    private String name;

    private Boolean isActive;

    private Integer slotDuration; // in minutes

    private Integer maxCapacity;
}
