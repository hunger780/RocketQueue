package com.rocketqueue.service;

import com.rocketqueue.entity.Customer;
import com.rocketqueue.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.findById(id);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> updateCustomer(String id, Customer customerDetails) {
        return customerRepository.findById(id).map(customer -> {
            customer.setName(customerDetails.getName());
            customer.setEmail(customerDetails.getEmail());
            customer.setPhone(customerDetails.getPhone());
            customer.setRole(customerDetails.getRole());
            return customerRepository.save(customer);
        });
    }

    public void deleteCustomer(String id) {
        customerRepository.deleteById(id);
    }
    
    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
}
