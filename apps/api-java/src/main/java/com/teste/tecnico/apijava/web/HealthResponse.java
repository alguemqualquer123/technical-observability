package com.teste.tecnico.apijava.web;

import com.teste.tecnico.apijava.domain.IncidentSummary;

public record HealthResponse(
    String status,
    String database,
    IncidentSummary summary
) {
}
