package com.forensics.todbackend.service;

import com.forensics.todbackend.dto.TodEstimateRequest;
import com.forensics.todbackend.dto.TodEstimateResponse;
import com.forensics.todbackend.exception.ValidationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class TodService {

    /**
     * Estimate cooling constant k from two temperature readings
     * Using Newton's Law of Cooling: T(t) = Te + (T0 - Te) * e^(-k*t)
     * 
     * @param T0 Normal body temperature at death
     * @param Te Ambient temperature
     * @param T1 First body temperature reading
     * @param T2 Second body temperature reading
     * @param deltaHours Time difference between readings
     * @return Estimated cooling constant k
     */
    public double estimateK(double T0, double Te, double T1, double T2, double deltaHours) {
        // Check for valid inputs
        if (Math.abs(T0 - Te) < 0.1) {
            throw new ValidationException("Normal body temperature and ambient temperature too close");
        }

        double R1 = (T1 - Te) / (T0 - Te);
        double R2 = (T2 - Te) / (T0 - Te);

        if (R1 <= 0 || R2 <= 0) {
            throw new ValidationException("Invalid temperature readings for k estimation");
        }

        if (R2 >= R1) {
            throw new ValidationException("Second reading should be lower than first reading");
        }

        // k = -(1/Δt) * ln(R2/R1)
        double k = -(1.0 / deltaHours) * Math.log(R2 / R1);

        if (k <= 0 || k > 5.0) {
            throw new ValidationException("Estimated k is unreasonable: " + k);
        }

        return k;
    }

    /**
     * Estimate time since death using Newton's Law of Cooling
     * 
     * @param T0 Normal body temperature at death
     * @param Te Ambient temperature
     * @param Tt Current body temperature
     * @param k Cooling constant
     * @return Time since death in hours
     */
    public double estimateTimeSinceDeath(double T0, double Te, double Tt, double k) {
        // Check for valid inputs
        if (Math.abs(T0 - Te) < 0.1) {
            throw new ValidationException("Normal body temperature and ambient temperature too close");
        }

        if (Math.abs(Tt - Te) < 0.1) {
            throw new ValidationException("Current body temperature too close to ambient temperature");
        }

        // t = -(1/k) * ln((T(t) - Te) / (T0 - Te))
        double ratio = (Tt - Te) / (T0 - Te);

        if (ratio <= 0 || ratio > 1) {
            throw new ValidationException("Invalid temperature ratio for time calculation: " + ratio);
        }

        double t = -(1.0 / k) * Math.log(ratio);

        if (t < 0) {
            throw new ValidationException("Calculated time since death is negative");
        }

        return t;
    }

    /**
     * Process TOD estimation request and return comprehensive response
     */
    public TodEstimateResponse processTodEstimate(TodEstimateRequest request) {
        List<String> steps = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        double k;
        double T0 = request.getNormalBodyTempC();
        double Te = request.getAmbientTempC();
        double T1 = request.getBodyTempC();

        steps.add("Newton's Law of Cooling: T(t) = Te + (T0 - Te) * e^(-k*t)");
        steps.add("Where: T0 = " + T0 + "°C (normal body temp), Te = " + Te + "°C (ambient temp)");

        // Step 1: Determine or estimate k
        if (request.hasSecondReading()) {
            // Estimate k from two readings
            double T2 = request.getSecondReading().getBodyTempC();
            double deltaHours = request.getSecondReading().getDeltaHoursFromFirst();

            k = estimateK(T0, Te, T1, T2, deltaHours);

            steps.add("Using two readings to estimate k:");
            steps.add("T1 = " + T1 + "°C at t1, T2 = " + T2 + "°C at t2 (Δt = " + deltaHours + " hours)");
            steps.add("R1 = (T1 - Te)/(T0 - Te) = " + String.format("%.4f", (T1 - Te)/(T0 - Te)));
            steps.add("R2 = (T2 - Te)/(T0 - Te) = " + String.format("%.4f", (T2 - Te)/(T0 - Te)));
            steps.add("k = -(1/Δt) * ln(R2/R1) = " + String.format("%.4f", k) + " h⁻¹");

            warnings.add("K estimation assumes constant ambient temperature between readings");
        } else if (request.hasProvidedK()) {
            k = request.getK();
            steps.add("Using provided cooling constant k = " + k + " h⁻¹");
            warnings.add("Using provided k value - ensure it's appropriate for conditions");
        } else {
            // Use default k (typical range 0.1-0.3 h⁻¹ for humans)
            k = 0.1947; // Commonly used default value
            steps.add("Using default cooling constant k = " + k + " h⁻¹");
            warnings.add("Using default k value - results may be inaccurate without proper k estimation");
        }

        // Step 2: Calculate time since death
        double timeSinceFirstReading = request.getTimeSinceFirstReadingHours();
        double timeSinceDeath = estimateTimeSinceDeath(T0, Te, T1, k) + timeSinceFirstReading;

        steps.add("Time since death calculation:");
        steps.add("t = -(1/k) * ln((T1 - Te)/(T0 - Te)) + time_to_first_reading");
        steps.add("t = -(1/" + String.format("%.4f", k) + ") * ln((" + T1 + " - " + Te + ")/(" + T0 + " - " + Te + ")) + " + timeSinceFirstReading);
        steps.add("t = " + String.format("%.2f", timeSinceDeath) + " hours");

        // Step 3: Calculate estimated time of death
        String estimatedTimeOfDeath = calculateTimeOfDeath(request.getSceneDateTime(), timeSinceDeath);

        // Add warnings based on conditions
        if (Math.abs(T1 - Te) < 2.0) {
            warnings.add("Body temperature very close to ambient - high uncertainty in estimate");
        }
        if (timeSinceDeath > 24) {
            warnings.add("Estimate is for >24 hours - Newton's cooling becomes less accurate");
        }
        if (Math.abs(T0 - 37.0) > 1.0) {
            warnings.add("Non-standard normal body temperature used - verify accuracy");
        }

        warnings.add("Assumptions: constant ambient temperature, no clothing/covering effects, standard body mass");
        warnings.add("This is an estimation tool - not suitable for legal determinations without expert validation");

        return TodEstimateResponse.builder()
                .k(k)
                .timeSinceDeathHours(Math.round(timeSinceDeath * 100.0) / 100.0)
                .estimatedTimeOfDeath(estimatedTimeOfDeath)
                .steps(steps)
                .warnings(warnings)
                .build();
    }

    private String calculateTimeOfDeath(String sceneDateTime, double hoursAgo) {
        LocalDateTime referenceTime;

        if (sceneDateTime != null && !sceneDateTime.trim().isEmpty()) {
            try {
                referenceTime = LocalDateTime.parse(sceneDateTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException e) {
                referenceTime = LocalDateTime.now();
            }
        } else {
            referenceTime = LocalDateTime.now();
        }

        LocalDateTime estimatedTod = referenceTime.minusHours((long) hoursAgo)
                .minusMinutes((long) ((hoursAgo - (long) hoursAgo) * 60));

        return estimatedTod.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
