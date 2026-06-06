package com.teste.tecnico.apijava.repository;

import com.teste.tecnico.apijava.domain.Incident;
import com.teste.tecnico.apijava.domain.IncidentSummary;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class IncidentRepository {

  private final JdbcTemplate jdbcTemplate;

  public IncidentRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void initSchema() {
    jdbcTemplate.execute("""
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        service TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        reporter TEXT NOT NULL,
        assignee TEXT,
        description TEXT NOT NULL,
        resolution_summary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        resolved_at TEXT
      )
      """);
  }

  public void deleteAll() {
    jdbcTemplate.update("DELETE FROM incidents");
  }

  public boolean hasAnyIncident() {
    Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM incidents", Integer.class);
    return total != null && total > 0;
  }

  public List<Incident> list(String status, String severity) {
    StringBuilder sql = new StringBuilder("""
      SELECT * FROM incidents
      WHERE (? IS NULL OR status = ?)
        AND (? IS NULL OR severity = ?)
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        datetime(created_at) DESC
      """);

    return jdbcTemplate.query(sql.toString(), this::mapRow, status, status, severity, severity);
  }

  public Optional<Incident> findById(String id) {
    List<Incident> incidents = jdbcTemplate.query(
        "SELECT * FROM incidents WHERE id = ?",
        this::mapRow,
        id
    );
    return incidents.stream().findFirst();
  }

  public Incident create(Incident incident) {
    jdbcTemplate.update("""
      INSERT INTO incidents (
        id, title, service, severity, status, reporter, assignee, description,
        resolution_summary, created_at, updated_at, resolved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      """,
        incident.id(),
        incident.title(),
        incident.service(),
        incident.severity(),
        incident.status(),
        incident.reporter(),
        emptyToNull(incident.assignee()),
        incident.description(),
        emptyToNull(incident.resolutionSummary()),
        incident.createdAt(),
        incident.updatedAt(),
        incident.resolvedAt()
    );

    return findById(incident.id()).orElseThrow();
  }

  public Incident update(Incident incident) {
    jdbcTemplate.update("""
      UPDATE incidents SET
        title = ?,
        service = ?,
        severity = ?,
        status = ?,
        reporter = ?,
        assignee = ?,
        description = ?,
        resolution_summary = ?,
        updated_at = ?,
        resolved_at = ?
      WHERE id = ?
      """,
        incident.title(),
        incident.service(),
        incident.severity(),
        incident.status(),
        incident.reporter(),
        emptyToNull(incident.assignee()),
        incident.description(),
        emptyToNull(incident.resolutionSummary()),
        incident.updatedAt(),
        incident.resolvedAt(),
        incident.id()
    );

    return findById(incident.id()).orElseThrow();
  }

  public IncidentSummary getSummary() {
    return jdbcTemplate.queryForObject("""
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) AS investigating_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_count
      FROM incidents
      """,
        (resultSet, rowNum) -> new IncidentSummary(
            resultSet.getInt("total"),
            resultSet.getInt("open_count"),
            resultSet.getInt("investigating_count"),
            resultSet.getInt("resolved_count"),
            resultSet.getInt("critical_count")
        )
    );
  }

  private Incident mapRow(ResultSet resultSet, int rowNum) throws SQLException {
    return new Incident(
        resultSet.getString("id"),
        resultSet.getString("title"),
        resultSet.getString("service"),
        resultSet.getString("severity"),
        resultSet.getString("status"),
        resultSet.getString("reporter"),
        nullToEmpty(resultSet.getString("assignee")),
        resultSet.getString("description"),
        nullToEmpty(resultSet.getString("resolution_summary")),
        resultSet.getString("created_at"),
        resultSet.getString("updated_at"),
        resultSet.getString("resolved_at")
    );
  }

  private String emptyToNull(String value) {
    return value == null || value.isBlank() ? null : value;
  }

  private String nullToEmpty(String value) {
    return value == null ? "" : value;
  }
}
