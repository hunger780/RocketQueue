package com.rocketqueue.controller;

import com.rocketqueue.entity.ServiceLine;
import com.rocketqueue.entity.Shop;
import com.rocketqueue.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public List<Shop> getAllShops(@RequestParam(required = false) String category) {
        if (category != null) {
            return shopService.findShopsByCategory(category);
        }
        return shopService.getAllShops();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable String id) {
        return shopService.getShopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Shop createShop(@RequestBody Shop shop) {
        return shopService.createShop(shop);
    }

    @PostMapping("/{id}/service-lines")
    public ResponseEntity<ServiceLine> addServiceLine(@PathVariable String id, @RequestBody ServiceLine serviceLine) {
        try {
            return ResponseEntity.ok(shopService.addServiceLine(id, serviceLine));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/service-lines")
    public List<ServiceLine> getServiceLines(@PathVariable String id) {
        return shopService.getServiceLinesByShop(id);
    }
}
