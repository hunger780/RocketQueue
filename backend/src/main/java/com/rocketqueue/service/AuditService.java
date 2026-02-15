package com.rocketqueue.service;

import com.rocketqueue.entity.BookingAudit;
import com.rocketqueue.entity.LoginAudit;
import com.rocketqueue.repository.BookingAuditRepository;
import com.rocketqueue.repository.LoginAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final LoginAuditRepository loginAuditRepository;
    private final BookingAuditRepository bookingAuditRepository;

    public void logLogin(String userId, String status, String ipAddress) {
        LoginAudit audit = new LoginAudit();
        audit.setUserId(userId);
        audit.setTimestamp(LocalDateTime.now());
        audit.setStatus(status);
        audit.setIpAddress(ipAddress);
        loginAuditRepository.save(audit);
    }

    public void logBookingAction(String bookingId, String action, String details) {
        BookingAudit audit = new BookingAudit();
        audit.setBookingId(bookingId);
        audit.setTimestamp(LocalDateTime.now());
        audit.setAction(action);
        audit.setDetails(details);
        bookingAuditRepository.save(audit);
    }
}
