package com.teste.tecnico.apijava.domain;

public enum IncidentSeverity {
  low,
  medium,
  high,
  critical;

  public static boolean isValid(String value) {
    if (value == null) {
      return false;
    }

    for (IncidentSeverity item : values()) {
      if (item.name().equals(value)) {
        return true;
      }
    }

    return false;
  }
}
