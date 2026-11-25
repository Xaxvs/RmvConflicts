package io.github.xaxis.rmvconflicts.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Locale;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @CreationTimestamp
  @Column(nullable = false, updatable = false, name = "created_at")
  private Instant createdAt;

  @Column(nullable = false, name = "password_hash")
  private String passwordHash;

  @Setter
  @Column(nullable = false, unique = true, name = "username")
  private String username;

  @Setter
  @Column(nullable = false)
  private String email;

  @Setter
  @Column(name = "last_activity_at")
  private Instant lastActivityAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserStatus status;

  protected User() {}

  public User(String username, String email, String passwordHash) {
    this.username = username.toLowerCase(Locale.ROOT);
    this.email = email.toLowerCase(Locale.ROOT);
    this.passwordHash = passwordHash;
    this.status = UserStatus.IDLE;
  }

  public void setActive() {
    status = UserStatus.CLAIM_ACTIVE;
  }

  public void setIdle() {
    status = UserStatus.IDLE;
  }
}
