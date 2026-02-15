package com.rocketqueue.controller;

import com.rocketqueue.dto.LoginRequest;
import com.rocketqueue.entity.Customer;
import com.rocketqueue.service.AuthService;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Customer> login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest.getEmail(), loginRequest.getPassword())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

}
