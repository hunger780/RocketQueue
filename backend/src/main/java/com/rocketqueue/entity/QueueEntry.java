package com.rocketqueue.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
public class QueueEntry {
    @Id
    private String id;
    private String userId;
    private String userName;
    private Long joinedAt;
    private String status; // Using String for simplicity, can be Enum
    private int estimatedMinutes;

    @ManyToOne
    @JoinColumn(name = "service_line_id")
    private ServiceLine serviceLine;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public Long getJoinedAt() {
		return joinedAt;
	}

	public void setJoinedAt(Long joinedAt) {
		this.joinedAt = joinedAt;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getEstimatedMinutes() {
		return estimatedMinutes;
	}

	public void setEstimatedMinutes(int estimatedMinutes) {
		this.estimatedMinutes = estimatedMinutes;
	}

	public ServiceLine getServiceLine() {
		return serviceLine;
	}

	public void setServiceLine(ServiceLine serviceLine) {
		this.serviceLine = serviceLine;
	}
    
    
}
