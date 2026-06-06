package com.teste.tecnico.apijava.web;

public record CreateIncidentRequest(
    String title,
    String service,
    String severity,
    String reporter,
    String assignee,
    String description
) {
}
