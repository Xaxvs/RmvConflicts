package io.github.xaxis.rmvconflicts.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Authentication {

  private final JdbcTemplate jdbcTemplate;

  public Authentication(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @PostMapping("/auth")
  public ResponseEntity<Void> authenticate(@RequestHeader("Authorization") String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String key = authHeader.substring(7).trim();

    Integer count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM whitelist_keys WHERE api_key = ? AND active = TRUE",
            Integer.class,
            key);

    if (count != null && count > 0) {
      return ResponseEntity.ok().build();
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
  }
}
