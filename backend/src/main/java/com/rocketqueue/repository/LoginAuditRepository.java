package com.rocketqueue.repository;

import com.rocketqueue.entity.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginAuditRepository extends JpaRepository<LoginAudit, String> {
    List<LoginAudit> findByUserId(String userId);
}
