package com.teste.tecnico.apijava.seed;

import com.teste.tecnico.apijava.domain.Incident;
import java.util.List;

public final class SeedData {

  private SeedData() {
  }

  public static List<Incident> incidents() {
    return List.of(
        new Incident(
            "INC-1001",
            "Latencia elevada na API de autenticacao",
            "auth-service",
            "high",
            "investigating",
            "NOC",
            "Squad Plataforma",
            "Usuarios reportaram aumento no tempo de login apos o deploy da versao 2.14.3.",
            "",
            "2026-06-05T11:20:00.000Z",
            "2026-06-05T12:05:00.000Z",
            null
        ),
        new Incident(
            "INC-1002",
            "Fila de pagamentos acumulando mensagens",
            "payment-worker",
            "critical",
            "open",
            "Monitoramento",
            "Operacoes",
            "A fila principal de pagamentos ultrapassou o limite esperado e ja impacta o prazo de confirmacao.",
            "",
            "2026-06-06T08:15:00.000Z",
            "2026-06-06T08:15:00.000Z",
            null
        )
    );
  }
}
