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
