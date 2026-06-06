package com.teste.tecnico.apijava.domain;

public record Incident(
    String id,
    String title,
    String service,
    String severity,
    String status,
    String reporter,
    String assignee,
    String description,
    String resolutionSummary,
    String createdAt,
    String updatedAt,
    String resolvedAt
) {
}
