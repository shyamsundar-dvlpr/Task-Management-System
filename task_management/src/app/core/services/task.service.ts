import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environment';
import { CreateTask, PagedResult, Task, UpdateTask } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private baseUrl = `${environment.apiUrl}/task`;

  tasks = signal<Task[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  loadMyTasks() {
    this.loading.set(true);

    this.http.get<Task[]>(`${this.baseUrl}/my-tasks`)
      .subscribe({
        next: (res) => {
          this.tasks.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
        }
      });
  }
  
  completeTask(id: number) {
       return this.http.put(`${this.baseUrl}/${id}`, { status: 'Completed' });
    }
    
    createTask(form: CreateTask) {
        return this.http.post(`${this.baseUrl}`, form).pipe(
          tap((res) => console.log('Create task response:', res))
        );
    }

    deleteTask(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`)
    }

    editTask(id: number, form: UpdateTask) {
      return this.http.put(`${this.baseUrl}/${id}`, form);
    }

    loadAllTasks() {
        this.loading.set(true);
        this.http.get<Task[]>(`${this.baseUrl}`)
          .subscribe({
            next: (res) => {
              this.tasks.set(res);
              this.loading.set(false);
            }
          });
    }

    getTasksPage(page: number, pageSize: number, search: string = '') {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize)});
      if(search) params.set('search', search);
      return this.http.get<PagedResult<Task>>(`${this.baseUrl}/pages?${params}`);
    }
}
