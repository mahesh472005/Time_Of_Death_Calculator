package com.forensics.todbackend;

import com.forensics.todbackend.service.TodService;
import com.forensics.todbackend.dto.TodEstimateRequest;
import com.forensics.todbackend.dto.TodEstimateResponse;
import com.forensics.todbackend.dto.SecondReading;
import com.forensics.todbackend.exception.ValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TodServiceTest {

    private final TodService todService = new TodService();

    @Test
    public void testEstimateK_ValidInputs() {
        // Test k estimation with valid inputs
        double k = todService.estimateK(37.0, 20.0, 34.0, 32.0, 1.0);
        assertTrue(k > 0 && k < 5.0, "K should be positive and reasonable");
    }

    @Test
    public void testEstimateK_InvalidInputs() {
        // Test with temperatures too close
        assertThrows(ValidationException.class, () ->
            todService.estimateK(20.0, 20.0, 20.0, 19.0, 1.0)
        );
    }

    @Test
    public void testEstimateTimeSinceDeath_ValidInputs() {
        double timeSinceDeath = todService.estimateTimeSinceDeath(37.0, 20.0, 32.0, 0.1947);
        assertTrue(timeSinceDeath > 0, "Time since death should be positive");
    }

    @Test
    public void testEstimateTimeSinceDeath_InvalidRatio() {
        // Test with body temp lower than ambient
        assertThrows(ValidationException.class, () ->
            todService.estimateTimeSinceDeath(37.0, 25.0, 20.0, 0.1947)
        );
    }

    @Test
    public void testProcessTodEstimate_SingleReading() {
        TodEstimateRequest request = new TodEstimateRequest();
        request.setAmbientTempC(20.0);
        request.setBodyTempC(32.0);
        request.setTimeSinceFirstReadingHours(0.0);
        request.setNormalBodyTempC(37.0);
        request.setK(0.1947);

        TodEstimateResponse response = todService.processTodEstimate(request);

        assertNotNull(response);
        assertTrue(response.getTimeSinceDeathHours() > 0);
        assertNotNull(response.getEstimatedTimeOfDeath());
        assertFalse(response.getSteps().isEmpty());
        assertFalse(response.getWarnings().isEmpty());
    }

    @Test
    public void testProcessTodEstimate_TwoReadings() {
        TodEstimateRequest request = new TodEstimateRequest();
        request.setAmbientTempC(20.0);
        request.setBodyTempC(34.0);
        request.setTimeSinceFirstReadingHours(0.0);
        request.setNormalBodyTempC(37.0);

        SecondReading secondReading = new SecondReading();
        secondReading.setBodyTempC(32.0);
        secondReading.setDeltaHoursFromFirst(1.0);
        request.setSecondReading(secondReading);

        TodEstimateResponse response = todService.processTodEstimate(request);

        assertNotNull(response);
        assertTrue(response.getK() > 0);
        assertTrue(response.getTimeSinceDeathHours() > 0);
        assertNotNull(response.getEstimatedTimeOfDeath());
    }

    @Test
    public void testProcessTodEstimate_EdgeCases() {
        // Test with body temp very close to ambient
        TodEstimateRequest request = new TodEstimateRequest();
        request.setAmbientTempC(20.0);
        request.setBodyTempC(20.5); // Very close to ambient
        request.setTimeSinceFirstReadingHours(0.0);
        request.setNormalBodyTempC(37.0);
        request.setK(0.1947);

        TodEstimateResponse response = todService.processTodEstimate(request);
        assertTrue(response.getWarnings().stream()
            .anyMatch(w -> w.contains("close to ambient")));
    }
}
