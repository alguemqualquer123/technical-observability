package com.teste.tecnico.apijava.web;

import com.teste.tecnico.apijava.domain.Incident;
import com.teste.tecnico.apijava.domain.IncidentSummary;
import com.teste.tecnico.apijava.service.IncidentService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class IncidentController {

  private static final Logger logger = LoggerFactory.getLogger(IncidentController.class);

  private final IncidentService incidentService;

  public IncidentController(IncidentService incidentService) {
    this.incidentService = incidentService;
  }

  @GetMapping("/health")
  public HealthResponse health() {
    return new HealthResponse("ok", "ready", incidentService.summary());
  }

  @GetMapping("/api/incidents")
  public IncidentListResponse list(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String severity
  ) {
    return new IncidentListResponse(incidentService.list(status, severity));
  }

  @GetMapping("/api/incidents/summary")
  public IncidentSummary summary() {
    return incidentService.summary();
  }

  @GetMapping("/api/incidents/{id}")
  public Incident getById(@PathVariable String id) {
    return incidentService.getById(id);
  }

  @PostMapping("/api/incidents")
  @ResponseStatus(HttpStatus.CREATED)
  public Incident create(
      @RequestBody CreateIncidentRequest request,
      @RequestHeader(value = "x-request-id", required = false) String requestId
  ) {
    Incident incident = incidentService.create(request);
    logger.info("incident created requestId={} incidentId={} service={} severity={}",
        requestId, incident.id(), incident.service(), incident.severity());
    return incident;
  }

  @PatchMapping("/api/incidents/{id}")
  public Incident update(
      @PathVariable String id,
      @RequestBody UpdateIncidentRequest request,
      @RequestHeader(value = "x-request-id", required = false) String requestId
  ) {
    Incident previous = incidentService.getById(id);
    Incident updated = incidentService.update(id, request);
    logger.info("incident status updated requestId={} incidentId={} previousStatus={} currentStatus={}",
        requestId, updated.id(), previous.status(), updated.status());
    return updated;
  }
}
