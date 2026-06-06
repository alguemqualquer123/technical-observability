package com.teste.tecnico.apijava.domain;

public enum IncidentStatus {
  open,
  investigating,
  resolved;

  public static boolean isValid(String value) {
    if (value == null) {
      return false;
    }

    for (IncidentStatus item : values()) {
      if (item.name().equals(value)) {
        return true;
      }
    }

    return false;
  }
}
