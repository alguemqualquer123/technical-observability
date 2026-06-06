package com.teste.tecnico.apijava.domain;

public record IncidentSummary(
    int total,
    int open,
    int investigating,
    int resolved,
    int critical
) {
}
