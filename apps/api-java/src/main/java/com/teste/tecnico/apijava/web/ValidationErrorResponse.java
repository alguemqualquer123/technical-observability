package com.teste.tecnico.apijava.web;

import com.teste.tecnico.apijava.service.ValidationException;
import java.util.List;

public record ValidationErrorResponse(
    String message,
    List<ValidationException.FieldError> errors
) {
}
