package com.teste.tecnico.apijava.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component("incidentRequestContextFilter")
public class RequestContextFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(RequestContextFilter.class);

  @Value("${app.cors-origin:http://localhost:5173}")
  private String corsOrigin;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    response.setHeader("Access-Control-Allow-Origin", corsOrigin);
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-request-id");

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      response.setStatus(HttpServletResponse.SC_NO_CONTENT);
      return;
    }

    String requestId = Optional.ofNullable(request.getHeader("x-request-id")).orElseGet(() -> UUID.randomUUID().toString());
    response.setHeader("x-request-id", requestId);

    try {
      filterChain.doFilter(request, response);
    } finally {
      logger.info("request completed requestId={} method={} path={} statusCode={}",
          requestId,
          request.getMethod(),
          request.getRequestURI(),
          response.getStatus());
    }
  }
}
