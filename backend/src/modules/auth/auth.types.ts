export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
};

export type AuthResult = {
  message: string;
  token: string;
  refreshToken: string;
  user: PublicUser;
};

export type PasswordResetResult = {
  message: string;
};
