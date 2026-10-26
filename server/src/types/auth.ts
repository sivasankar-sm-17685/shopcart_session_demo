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
