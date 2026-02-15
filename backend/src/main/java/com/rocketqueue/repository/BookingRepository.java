package com.rocketqueue.repository;

import com.rocketqueue.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByCustomerId(String customerId);
    List<Booking> findByShopId(String shopId);
    List<Booking> findByServiceLineId(String serviceLineId);
}
