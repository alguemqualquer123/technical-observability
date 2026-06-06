package com.teste.tecnico.apijava.service;

import com.teste.tecnico.apijava.domain.Incident;
import com.teste.tecnico.apijava.domain.IncidentSummary;
import com.teste.tecnico.apijava.repository.IncidentRepository;
import com.teste.tecnico.apijava.web.CreateIncidentRequest;
import com.teste.tecnico.apijava.web.UpdateIncidentRequest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class IncidentService {

  private final IncidentRepository incidentRepository;
  private final IncidentValidator incidentValidator;
  private final SecureRandom secureRandom = new SecureRandom();

  public IncidentService(IncidentRepository incidentRepository, IncidentValidator incidentValidator) {
    this.incidentRepository = incidentRepository;
    this.incidentValidator = incidentValidator;
  }

  public List<Incident> list(String status, String severity) {
    return incidentRepository.list(status, severity);
  }

  public IncidentSummary summary() {
    return incidentRepository.getSummary();
  }

  public Incident getById(String id) {
    return incidentRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Incidente nao encontrado."));
  }

  public Incident create(CreateIncidentRequest request) {
    incidentValidator.validateCreate(request);

    String now = Instant.now().toString();
    Incident incident = new Incident(
        buildIncidentId(),
        request.title().trim(),
        request.service().trim(),
        request.severity(),
        "open",
        request.reporter().trim(),
        trimToEmpty(request.assignee()),
        request.description().trim(),
        "",
        now,
        now,
        null
    );

    return incidentRepository.create(incident);
  }

  public Incident update(String id, UpdateIncidentRequest request) {
    incidentValidator.validateUpdate(request);

    Incident current = getById(id);
    String status = request.status();
    String updatedAt = Instant.now().toString();

    Incident updated = new Incident(
        current.id(),
        current.title(),
        current.service(),
        current.severity(),
        status,
        current.reporter(),
        trimToFallback(request.assignee(), current.assignee()),
        current.description(),
        trimToFallback(request.resolutionSummary(), current.resolutionSummary()),
        current.createdAt(),
        updatedAt,
        "resolved".equals(status) ? updatedAt : null
    );

    return incidentRepository.update(updated);
  }

  private String buildIncidentId() {
    int code = 1000 + secureRandom.nextInt(9000);
    return "INC-" + code;
  }

  private String trimToEmpty(String value) {
    return value == null ? "" : value.trim();
  }

  private String trimToFallback(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value.trim();
  }
}
