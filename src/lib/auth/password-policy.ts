export const PASSWORD_MIN_LENGTH = 12;

export const SPECIAL_PASSWORD_CHARACTERS =
  "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export const PASSWORD_POLICY_MESSAGE =
  "Use at least 12 characters with uppercase, lowercase, number, and symbol.";

export function getPasswordPolicyError(password: string) {
  const hasMinimumLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = Array.from(password).some((character) =>
    SPECIAL_PASSWORD_CHARACTERS.includes(character),
  );

  if (
    hasMinimumLength &&
    hasLowercase &&
    hasUppercase &&
    hasNumber &&
    hasSpecialCharacter
  ) {
    return "";
  }

  return PASSWORD_POLICY_MESSAGE;
}
