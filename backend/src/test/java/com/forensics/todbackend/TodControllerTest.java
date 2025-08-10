package com.forensics.todbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.forensics.todbackend.dto.TodEstimateRequest;
import com.forensics.todbackend.dto.SecondReading;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
public class TodControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/tod/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("TOD Calculator API is running"));
    }

    @Test
    public void testEstimateTimeOfDeath_ValidRequest() throws Exception {
        TodEstimateRequest request = new TodEstimateRequest();
        request.setAmbientTempC(20.0);
        request.setBodyTempC(32.0);
        request.setTimeSinceFirstReadingHours(0.0);
        request.setNormalBodyTempC(37.0);
        request.setK(0.1947);

        mockMvc.perform(post("/api/tod/estimate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.k").exists())
                .andExpect(jsonPath("$.timeSinceDeathHours").exists())
                .andExpect(jsonPath("$.estimatedTimeOfDeath").exists())
                .andExpect(jsonPath("$.steps").isArray())
                .andExpect(jsonPath("$.warnings").isArray());
    }

    @Test
    public void testEstimateTimeOfDeath_InvalidRequest() throws Exception {
        TodEstimateRequest request = new TodEstimateRequest();
        // Missing required fields should trigger validation errors

        mockMvc.perform(post("/api/tod/estimate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testEstimateTimeOfDeath_WithSecondReading() throws Exception {
        TodEstimateRequest request = new TodEstimateRequest();
        request.setAmbientTempC(20.0);
        request.setBodyTempC(34.0);
        request.setTimeSinceFirstReadingHours(0.0);
        request.setNormalBodyTempC(37.0);

        SecondReading secondReading = new SecondReading();
        secondReading.setBodyTempC(32.0);
        secondReading.setDeltaHoursFromFirst(1.0);
        request.setSecondReading(secondReading);

        mockMvc.perform(post("/api/tod/estimate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.k").exists())
                .andExpect(jsonPath("$.timeSinceDeathHours").exists());
    }
}
