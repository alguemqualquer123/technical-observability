package com.teste.tecnico.apijava.web;

public record UpdateIncidentRequest(
    String status,
    String assignee,
    String resolutionSummary
) {
}
