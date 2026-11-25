package io.github.xaxis.rmvconflicts.user;

import io.github.xaxis.rmvconflicts.api.pageable.PageableUtils;
import io.github.xaxis.rmvconflicts.specifications.UserSpecifications;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserManager {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserManager(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public boolean userExistsByEmail(String email) {
    return userRepository.existsByEmail(email.trim().toLowerCase(Locale.ROOT));
  }

  public boolean userExistsByUsername(String username) {
    return userRepository.existsByUsername(username.trim().toLowerCase(Locale.ROOT));
  }

  public User createUser(String displayName, String email, String passwordHash) {
    return userRepository.save(
        new User(
            displayName.trim().toLowerCase(Locale.ROOT),
            email.trim().toLowerCase(Locale.ROOT),
            passwordEncoder.encode(passwordHash)));
  }

  @Transactional
  public User login(String email, String password) {
    User user =
        userRepository
            .findOne(UserSpecifications.emailMatches(email))
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    user.setLastActivityAt(Instant.now());
    return user;
  }

  @Transactional
  public void deleteUser(@NotNull Long id) {
    User user = getUser(id);
    userRepository.delete(user);
  }

  public User getUser(@NotNull Long id) {
    return getUserById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  public User getUserByUsername(String username) {
    return userRepository
        .findOne(UserSpecifications.usernameMatches(username))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  public Optional<User> getUserById(@NotNull Long id) {
    return userRepository.findById(id);
  }

  public Page<User> findUsers(
      int page, int size, String direction, String sortBy, UserStatus userStatus, String query) {
    return userRepository.findAll(
        UserSpecifications.statusMatches(userStatus)
            .and(UserSpecifications.usernameOrEmailMatches(query)),
        PageableUtils.createPageable(page, size, direction, sortBy));
  }
}
