package com.forensics.todbackend.controller;

import com.forensics.todbackend.dto.TodEstimateRequest;
import com.forensics.todbackend.dto.TodEstimateResponse;
import com.forensics.todbackend.service.TodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tod")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TodController {

    @Autowired
    private TodService todService;

    @PostMapping("/estimate")
    public ResponseEntity<TodEstimateResponse> estimateTimeOfDeath(
            @Valid @RequestBody TodEstimateRequest request) {

        TodEstimateResponse response = todService.processTodEstimate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("TOD Calculator API is running");
    }
}
