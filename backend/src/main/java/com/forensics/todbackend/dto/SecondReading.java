package com.forensics.todbackend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SecondReading {
    @NotNull(message = "Body temperature for second reading is required")
    @DecimalMin(value = "0.0", message = "Body temperature must be at least 0°C")
    @DecimalMax(value = "45.0", message = "Body temperature must be at most 45°C")
    private Double bodyTempC;

    @NotNull(message = "Delta hours from first reading is required")
    @Positive(message = "Delta hours must be positive")
    private Double deltaHoursFromFirst;
}
