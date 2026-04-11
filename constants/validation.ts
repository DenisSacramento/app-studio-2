// constants/validation.ts

export const VALIDATION = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MIN_LENGTH: 1,
  EMAIL_MAX_LENGTH: 255,

  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Name
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,

  // Messages
  MESSAGES: {
    EMPTY_NAME: 'Por favor, informe o seu nome.',
    SHORT_NAME: `Nome deve ter no mínimo ${2} caracteres.`,
    LONG_NAME: `Nome não pode ter mais de ${100} caracteres.`,

    EMPTY_EMAIL: 'Por favor, informe o seu email.',
    INVALID_EMAIL: 'Informe um email válido.',

    EMPTY_PASSWORD: 'Por favor, informe a senha.',
    SHORT_PASSWORD: `Senha deve ter no mínimo ${8} caracteres.`,
    WEAK_PASSWORD: 'Senha deve conter maiúscula, minúscula, número e caractere especial.',
  },
};

// Hook para usar as validações
export function useFormValidation() {
  const validateEmail = (email: string): boolean => {
    return VALIDATION.EMAIL_REGEX.test(email.trim());
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
  };

  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    return trimmed.length >= VALIDATION.NAME_MIN_LENGTH;
  };

  return {
    validateEmail,
    validatePassword,
    validateName,
    VALIDATION,
  };
}
