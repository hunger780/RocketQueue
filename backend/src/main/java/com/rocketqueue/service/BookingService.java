package com.rocketqueue.service;

import com.rocketqueue.entity.Booking;
import com.rocketqueue.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private BookingRepository bookingRepository;
    private AuditService auditService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByCustomer(String customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public List<Booking> getBookingsByShop(String shopId) {
        return bookingRepository.findByShopId(shopId);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        booking.setJoinedAt(LocalDateTime.now());
        booking.setStatus("confirmed"); // Default status
        Booking savedBooking = bookingRepository.save(booking);
        
        auditService.logBookingAction(savedBooking.getId(), "CREATED", "Booking created for customer " + booking.getCustomerId());
        
        return savedBooking;
    }

    @Transactional
    public Booking updateBookingStatus(String id, String status) {
        return bookingRepository.findById(id).map(booking -> {
            String oldStatus = booking.getStatus();
            booking.setStatus(status);
            Booking updatedBooking = bookingRepository.save(booking);
            
            auditService.logBookingAction(id, "UPDATED", "Status changed from " + oldStatus + " to " + status);
            return updatedBooking;
        }).orElseThrow(() -> new RuntimeException("Booking not found"));
    }
    
    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }
}
