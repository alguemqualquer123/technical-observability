package com.teste.tecnico.apijava;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.teste.tecnico.apijava.repository.IncidentRepository;
import com.teste.tecnico.apijava.seed.SeedData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "app.database-file=apps/api-java/target/test-data/incidents-test.sqlite"
})
class IncidentApiApplicationTests {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private IncidentRepository incidentRepository;

  @BeforeEach
  void setUp() {
    incidentRepository.initSchema();
    incidentRepository.deleteAll();
    for (var incident : SeedData.incidents()) {
      incidentRepository.create(incident);
    }
  }

  @Test
  void listaIncidentesCadastrados() throws Exception {
    mockMvc.perform(get("/api/incidents"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.incidents.length()").value(2));
  }

  @Test
  void criaUmIncidenteValido() throws Exception {
    mockMvc.perform(post("/api/incidents")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "title": "Erro 500 ao consultar historico do cliente",
                  "service": "customer-api",
                  "severity": "medium",
                  "reporter": "Suporte",
                  "description": "Ao abrir o historico do cliente, a tela falha para um subconjunto de contas antigas.",
                  "assignee": "Time Core"
                }
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("open"))
        .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.matchesPattern("^INC-\\d{4}$")));
  }

  @Test
  void rejeitaAtualizacaoResolvidaSemResumo() throws Exception {
    mockMvc.perform(patch("/api/incidents/INC-1002")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "status": "resolved"
                }
                """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors[0].field").value("resolutionSummary"));
  }

  @Test
  void retornaResumoOperacional() throws Exception {
    mockMvc.perform(get("/api/incidents/summary"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(2))
        .andExpect(jsonPath("$.critical").value(1));
  }
}
