package com.teste.tecnico.apijava.service;

import java.util.List;

public class ValidationException extends RuntimeException {

  private final List<FieldError> errors;

  public ValidationException(List<FieldError> errors) {
    super("Falha de validacao.");
    this.errors = errors;
  }

  public List<FieldError> getErrors() {
    return errors;
  }

  public record FieldError(String field, String message) {
  }
}
