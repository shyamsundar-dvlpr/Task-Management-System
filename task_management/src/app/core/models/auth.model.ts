export interface LoginDto {
    username: string | null;
    password: string | null;
}

export interface RegisterDto {
    username: string;
    password: string;
}

export interface AuthResponse{
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
     unique_name: string;
       role: 'Admin' | 'User';
       sub: string;
  exp: number;
       iat: number;
   }