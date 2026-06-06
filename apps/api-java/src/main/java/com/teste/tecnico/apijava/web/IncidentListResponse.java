package com.teste.tecnico.apijava.web;

import com.teste.tecnico.apijava.domain.Incident;
import java.util.List;

public record IncidentListResponse(List<Incident> incidents) {
}
