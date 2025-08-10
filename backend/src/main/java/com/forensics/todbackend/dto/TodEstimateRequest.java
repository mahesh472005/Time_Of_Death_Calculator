package com.forensics.todbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class TodEstimateRequest {
    @NotNull(message = "Ambient temperature is required")
    @DecimalMin(value = "-30.0", message = "Ambient temperature must be at least -30°C")
    @DecimalMax(value = "50.0", message = "Ambient temperature must be at most 50°C")
    private Double ambientTempC;

    @NotNull(message = "Body temperature is required")
    @DecimalMin(value = "0.0", message = "Body temperature must be at least 0°C")
    @DecimalMax(value = "45.0", message = "Body temperature must be at most 45°C")
    private Double bodyTempC;

    @NotNull(message = "Time since first reading is required")
    @PositiveOrZero(message = "Time since first reading must be zero or positive")
    private Double timeSinceFirstReadingHours;

    @DecimalMin(value = "35.0", message = "Normal body temperature must be at least 35°C")
    @DecimalMax(value = "42.0", message = "Normal body temperature must be at most 42°C")
    private Double normalBodyTempC = 37.0; // Default 37°C

    @DecimalMin(value = "0.001", message = "Cooling constant k must be positive")
    @DecimalMax(value = "5.0", message = "Cooling constant k must be reasonable (≤5.0)")
    private Double k;

    @Valid
    private SecondReading secondReading;

    private String sceneDateTime; // ISO-8601 format

    // Custom validation logic
    public boolean hasSecondReading() {
        return secondReading != null;
    }

    public boolean hasProvidedK() {
        return k != null;
    }
}
