export interface User {
  id: string;
  email?: string;
  role?: string;
  full_name?: string;
}

export interface Session {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  user: User;
}
