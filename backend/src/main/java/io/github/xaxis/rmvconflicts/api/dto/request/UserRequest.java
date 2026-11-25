package io.github.xaxis.rmvconflicts.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRequest(
    @NotBlank String displayName,
    @NotBlank @Email String email,
    @NotBlank
    @Size(min = 8, max = 72, message = "Password must be between 6 and 100 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).*$",
        message = "Password must contain at least one number and one special character"
    )
    String password
) {}
