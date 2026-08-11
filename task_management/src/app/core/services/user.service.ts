import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '../../../environment';
import { User, CreateUser, UpdateUser } from "../models/user.model";
import { PagedResult } from "../models/task.model";

@Injectable({providedIn:'root'})

export class UserService {
    private baseUrl = `${environment.apiUrl}/user`;
    
    constructor(private http: HttpClient) {}

    getUsers() {
        return this.http.get<User[]>(this.baseUrl);
    }

    getUser(id: number) {
        return this.http.get<User>(`${this.baseUrl}/${id}`);
    }

    getMe() {
        return this.http.get<User>(`${this.baseUrl}/me`);
    }

    createUser(form: CreateUser) {
        return this.http.post(`${this.baseUrl}`, form);
    }

    updateUser(id: number, form: UpdateUser) {
        return this.http.put(`${this.baseUrl}/${id}`, form);
    }

    deleteUser(id: number) {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
    getUsersByRole(role: string) {
        return this.http.get<User[]>(`${this.baseUrl}/role/${role}`);
    }
    getUsersPages(page: number, pageSize: number, search: string = '') {
        return this.http.get<PagedResult<User>>(`${this.baseUrl}/pages?page=${page}&pageSize=${pageSize}&search=${search}`);
    }
}