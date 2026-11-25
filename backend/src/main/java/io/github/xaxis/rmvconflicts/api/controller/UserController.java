package io.github.xaxis.rmvconflicts.api.controller;

import io.github.xaxis.rmvconflicts.api.dto.request.LoginRequest;
import io.github.xaxis.rmvconflicts.api.dto.request.UserRequest;
import io.github.xaxis.rmvconflicts.api.dto.response.AuthResponse;
import io.github.xaxis.rmvconflicts.api.dto.response.UserResponse;
import io.github.xaxis.rmvconflicts.api.pageable.PageResponse;
import io.github.xaxis.rmvconflicts.security.JwtService;
import io.github.xaxis.rmvconflicts.user.User;
import io.github.xaxis.rmvconflicts.user.UserManager;
import io.github.xaxis.rmvconflicts.user.UserStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

  private final UserManager userManager;
  private final JwtService jwtService;

  public UserController(UserManager userManager, JwtService jwtService) {
    this.userManager = userManager;
    this.jwtService = jwtService;
  }

  public UserResponse toUserResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getCreatedAt(),
        user.getLastActivityAt(),
        user.getStatus());
  }

  @DeleteMapping("/{id}")
  public void deleteUser(@PathVariable @NotNull Long id) {
    userManager.deleteUser(id);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
    User user = userManager.login(loginRequest.email(), loginRequest.password());
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    String token = jwtService.generateToken(user.getUsername());
    return ResponseEntity.ok(new AuthResponse(token, toUserResponse(user)));
  }

  @PostMapping
  public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {

    if (userManager.userExistsByEmail(userRequest.email())
        || userManager.userExistsByUsername(userRequest.displayName())) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    User user =
        userManager.createUser(
            userRequest.displayName(), userRequest.email(), userRequest.password());
    return ResponseEntity.status(HttpStatus.CREATED).body(toUserResponse(user));
  }

  @GetMapping("/{id}")
  public UserResponse getUser(@PathVariable @NotNull Long id) {
    User user = userManager.getUser(id);
    return toUserResponse(user);
  }

  @GetMapping
  public ResponseEntity<PageResponse<UserResponse>> getAgents(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "displayName") String sortBy,
      @RequestParam(defaultValue = "desc") String direction,
      @RequestParam(required = false) UserStatus userStatus,
      @RequestParam(required = false) String query) {

    Page<User> tickets = userManager.findUsers(page, size, direction, sortBy, userStatus, query);

    PageResponse<UserResponse> request =
        new PageResponse<>(
            tickets.getContent().stream().map(this::toUserResponse).toList(), tickets);

    return ResponseEntity.ok(request);
  }
}
