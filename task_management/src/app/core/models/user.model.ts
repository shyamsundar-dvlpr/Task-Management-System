export interface User {
    id: number;
    name: string;
    role: 'Admin' | 'User';
}

export interface CreateUser {
    name:string;
    password: string;
    role: 'Admin' | 'User';
}

export interface UpdateUser {
    name: string;
    role: 'Admin' | 'User';
    password?: string;
}