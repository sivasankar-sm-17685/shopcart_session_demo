export interface User {
  id: number;
  username: string;
  passwordHash: string;
  passwordSalt: string;
}
export type PublicUser = Omit<User, 'passwordHash' | 'passwordSalt'>;

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse extends Omit<LoginRequest, 'password'> {
  id: number;
  accessToken: string;
  email: string;
}

export type SignUpRequest = LoginRequest;

export type SignUpResponse = Omit<LoginRequest, 'password'> & { id: number };

export type CurrentUserResponse = Omit<LoginResponse, 'accessToken'>;
