package com.rocketqueue.repository;

import com.rocketqueue.entity.BookingAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingAuditRepository extends JpaRepository<BookingAudit, String> {
    List<BookingAudit> findByBookingId(String bookingId);
}
