package com.teste.tecnico.apijava.service;

import com.teste.tecnico.apijava.domain.IncidentSeverity;
import com.teste.tecnico.apijava.domain.IncidentStatus;
import com.teste.tecnico.apijava.web.CreateIncidentRequest;
import com.teste.tecnico.apijava.web.UpdateIncidentRequest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class IncidentValidator {

  public void validateCreate(CreateIncidentRequest request) {
    List<ValidationException.FieldError> errors = new ArrayList<>();

    validateMinLength("title", request.title(), 5, "Informe um titulo com ao menos 5 caracteres.", errors);
    validateMinLength("service", request.service(), 2, "Informe o servico afetado.", errors);
    validateEnum("severity", request.severity(), IncidentSeverity.isValid(request.severity()), errors);
    validateMinLength("reporter", request.reporter(), 3, "Informe o responsavel pelo reporte.", errors);
    validateMinLength("description", request.description(), 15, "Descreva o incidente com mais detalhes.", errors);
    validateOptionalMinLength("assignee", request.assignee(), 3, errors);

    if (!errors.isEmpty()) {
      throw new ValidationException(errors);
    }
  }

  public void validateUpdate(UpdateIncidentRequest request) {
    List<ValidationException.FieldError> errors = new ArrayList<>();

    if (!IncidentStatus.isValid(request.status())) {
      errors.add(new ValidationException.FieldError("status", "Valor invalido."));
    }

    validateOptionalMinLength("assignee", request.assignee(), 3, errors);
    validateOptionalMinLength("resolutionSummary", request.resolutionSummary(), 10, errors);

    if ("resolved".equals(request.status()) && isBlank(request.resolutionSummary())) {
      errors.add(new ValidationException.FieldError("resolutionSummary", "Informe um resumo da resolucao ao encerrar o incidente."));
    }

    if (!errors.isEmpty()) {
      throw new ValidationException(errors);
    }
  }

  private void validateEnum(String field, String value, boolean valid, List<ValidationException.FieldError> errors) {
    if (!valid) {
      errors.add(new ValidationException.FieldError(field, "Valor invalido."));
    }
  }

  private void validateMinLength(
      String field,
      String value,
      int minLength,
      String message,
      List<ValidationException.FieldError> errors
  ) {
    if (isBlank(value) || value.trim().length() < minLength) {
      errors.add(new ValidationException.FieldError(field, message));
    }
  }

  private void validateOptionalMinLength(
      String field,
      String value,
      int minLength,
      List<ValidationException.FieldError> errors
  ) {
    if (value != null && !value.isBlank() && value.trim().length() < minLength) {
      errors.add(new ValidationException.FieldError(field, "Valor invalido."));
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
