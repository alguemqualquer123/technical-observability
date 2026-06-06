package com.teste.tecnico.apijava.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.sqlite.SQLiteDataSource;

@Configuration
public class DatabaseConfig {

  @Bean
  public DataSource dataSource(@Value("${app.database-file:apps/api-java/data/incidents.sqlite}") String databaseFile) throws Exception {
    Path path = Paths.get(databaseFile).toAbsolutePath().normalize();
    Files.createDirectories(path.getParent());

    SQLiteDataSource dataSource = new SQLiteDataSource();
    dataSource.setUrl("jdbc:sqlite:" + path);
    return dataSource;
  }
}
