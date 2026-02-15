package com.rocketqueue.service;

import com.rocketqueue.entity.Customer;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service

public class AuthService {

    private final CustomerService customerService;
    private final AuditService auditService;

    public AuthService(CustomerService customerService, AuditService auditService) {
        this.customerService = customerService;
        this.auditService = auditService;
    }

    public Optional<Customer> login(String email, String password) {
        // Simple password check (In real app, use BCrypt)
        Optional<Customer> customerOpt = customerService.findByEmail(email);
        
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (password != null && password.equals(customer.getPassword())) {
                auditService.logLogin(customer.getId(), "SUCCESS", "127.0.0.1");
                return Optional.of(customer);
            } else {
                auditService.logLogin(customer.getId(), "FAILURE", "127.0.0.1");
            }
        } else {
             // Log attempt for unknown user?
             auditService.logLogin("UNKNOWN:" + email, "FAILURE", "127.0.0.1");
        }
        return Optional.empty();
    }
}
