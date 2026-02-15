package com.rocketqueue.controller;

import com.rocketqueue.entity.BookingAudit;
import com.rocketqueue.entity.LoginAudit;
import com.rocketqueue.repository.BookingAuditRepository;
import com.rocketqueue.repository.LoginAuditRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuditController {
	@Autowired
    private LoginAuditRepository loginAuditRepository;
	@Autowired
    private BookingAuditRepository bookingAuditRepository;

    @GetMapping("/login")
    public List<LoginAudit> getLoginAudits(@RequestParam(required = false) String userId) {
        if (userId != null) {
            return loginAuditRepository.findByUserId(userId);
        }
        return loginAuditRepository.findAll();
    }

    @GetMapping("/booking")
    public List<BookingAudit> getBookingAudits(@RequestParam(required = false) String bookingId) {
        if (bookingId != null) {
            return bookingAuditRepository.findByBookingId(bookingId);
        }
        return bookingAuditRepository.findAll();
    }
}
