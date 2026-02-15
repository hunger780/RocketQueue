package com.rocketqueue.service;

import com.rocketqueue.entity.ServiceLine;
import com.rocketqueue.entity.Shop;
import com.rocketqueue.repository.ServiceLineRepository;
import com.rocketqueue.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final ServiceLineRepository serviceLineRepository;

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public Optional<Shop> getShopById(String id) {
        return shopRepository.findById(id);
    }

    @Transactional
    public Shop createShop(Shop shop) {
        Shop savedShop = shopRepository.save(shop);
        if (shop.getServiceLines() != null) {
            for (ServiceLine sl : shop.getServiceLines()) {
                sl.setShop(savedShop);
                serviceLineRepository.save(sl);
            }
        }
        return savedShop;
    }

    public List<Shop> findShopsByCategory(String category) {
        return shopRepository.findByCategory(category);
    }

    // Service Line methods

    @Transactional
    public ServiceLine addServiceLine(String shopId, ServiceLine serviceLine) {
        return shopRepository.findById(shopId).map(shop -> {
            serviceLine.setShop(shop);
            return serviceLineRepository.save(serviceLine);
        }).orElseThrow(() -> new RuntimeException("Shop not found"));
    }

    public List<ServiceLine> getServiceLinesByShop(String shopId) {
        return serviceLineRepository.findByShopId(shopId);
    }
}
