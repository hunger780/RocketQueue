package com.rocketqueue.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "service_lines")
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

    @OneToMany(mappedBy = "serviceLine", cascade = CascadeType.ALL)
    private java.util.List<QueueEntry> entries;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Shop getShop() {
		return shop;
	}

	public void setShop(Shop shop) {
		this.shop = shop;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Boolean getIsActive() {
		return isActive;
	}

	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}

	public Integer getSlotDuration() {
		return slotDuration;
	}

	public void setSlotDuration(Integer slotDuration) {
		this.slotDuration = slotDuration;
	}

	public Integer getMaxCapacity() {
		return maxCapacity;
	}

	public void setMaxCapacity(Integer maxCapacity) {
		this.maxCapacity = maxCapacity;
	}

	public java.util.List<QueueEntry> getEntries() {
		return entries;
	}

	public void setEntries(java.util.List<QueueEntry> entries) {
		this.entries = entries;
	}
    
    
}
