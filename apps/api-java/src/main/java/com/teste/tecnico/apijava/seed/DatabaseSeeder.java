package com.teste.tecnico.apijava.seed;

import com.teste.tecnico.apijava.repository.IncidentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

  private final IncidentRepository incidentRepository;

  public DatabaseSeeder(IncidentRepository incidentRepository) {
    this.incidentRepository = incidentRepository;
  }

  @Override
  public void run(String... args) {
    incidentRepository.initSchema();

    if (incidentRepository.hasAnyIncident()) {
      return;
    }

    for (var incident : SeedData.incidents()) {
      incidentRepository.create(incident);
    }
  }
}
