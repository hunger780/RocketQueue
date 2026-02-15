package com.rocketqueue.controller;

import com.rocketqueue.entity.Booking;
import com.rocketqueue.service.BookingService;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private BookingService bookingService;

    @GetMapping
    public List<Booking> getAllBookings(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String shopId) {
        if (customerId != null) {
            return bookingService.getBookingsByCustomer(customerId);
        }
        if (shopId != null) {
            return bookingService.getBookingsByShop(shopId);
        }
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id, @RequestBody StatusUpdate request) {
        try {
            return ResponseEntity.ok(bookingService.updateBookingStatus(id, request.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Data
    public static class StatusUpdate {
        private String status;

		public String getStatus() {
			// TODO Auto-generated method stub
			return status;
		}
    }
}
