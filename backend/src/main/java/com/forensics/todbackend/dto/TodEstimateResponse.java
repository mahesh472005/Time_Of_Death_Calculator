package com.forensics.todbackend.dto;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class TodEstimateResponse {
    private Double k;
    private Double timeSinceDeathHours;
    private String estimatedTimeOfDeath;
    private List<String> steps;
    private List<String> warnings;
}
