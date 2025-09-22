// types/auth.ts
export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterData = AuthCredentials & {
  username: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};