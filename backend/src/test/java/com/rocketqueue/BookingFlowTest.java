package com.rocketqueue;

import com.rocketqueue.entity.*;
import com.rocketqueue.service.*;
import com.rocketqueue.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class BookingFlowTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ShopService shopService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingAuditRepository bookingAuditRepository;

    @Test
    public void testBookingFlow() {
        // 1. Create Customer
        Customer customer = new Customer();
        customer.setName("Test User");
        customer.setEmail("test@example.com");
        customer.setRole(Customer.UserRole.CUSTOMER);
        Customer savedCustomer = customerService.createCustomer(customer);
        assertNotNull(savedCustomer.getId());

        // 2. Create Shop & ServiceLine
        Shop shop = new Shop();
        shop.setName("Test Shop");
        shop.setVendorId("vendor-1");
        Shop savedShop = shopService.createShop(shop);
        
        ServiceLine serviceLine = new ServiceLine();
        serviceLine.setName("Test Queue");
        serviceLine.setIsActive(true);
        ServiceLine savedServiceLine = shopService.addServiceLine(savedShop.getId(), serviceLine);
        assertNotNull(savedServiceLine.getId());

        // 3. Create Booking
        Booking booking = new Booking();
        booking.setCustomerId(savedCustomer.getId());
        booking.setShopId(savedShop.getId());
        booking.setServiceLineId(savedServiceLine.getId());
        booking.setEstimatedMinutes(10);
        
        Booking savedBooking = bookingService.createBooking(booking);
        assertNotNull(savedBooking.getId());
        assertEquals("confirmed", savedBooking.getStatus());

        // 4. Verify Audit
        List<BookingAudit> audits = bookingAuditRepository.findByBookingId(savedBooking.getId());
        assertFalse(audits.isEmpty());
        assertEquals("CREATED", audits.get(0).getAction());
        
        // 5. Update Booking
        bookingService.updateBookingStatus(savedBooking.getId(), "completed");
        
        Booking updatedBooking = bookingService.getBookingById(savedBooking.getId()).orElseThrow();
        assertEquals("completed", updatedBooking.getStatus());
        
        // 6. Verify Update Audit
        audits = bookingAuditRepository.findByBookingId(savedBooking.getId());
        assertEquals(2, audits.size());
    }
}
