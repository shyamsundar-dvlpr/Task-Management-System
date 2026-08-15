import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../../environment';
import { CreateTask, PagedResult, Task, UpdateTask } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private baseUrl = `${environment.apiUrl}/task`;

  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);

  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private http: HttpClient) {}

  loadMyTasks() {
    this._loading.set(true);
    this.http.get<Task[]>(`${this.baseUrl}/my-tasks`)
      .subscribe({
        next: (res) => {
          this._tasks.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      });
  }

  loadAllTasks() {
    this._loading.set(true);
    this.http.get<Task[]>(`${this.baseUrl}`)
      .subscribe({
        next: (res) => {
          this._tasks.set(res);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      });
  }

  // Manages loading/tasks state internally; emits total count for pagination.
  loadTasksPage(page: number, pageSize: number, search = '') {
    this._loading.set(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    return this.http.get<PagedResult<Task>>(`${this.baseUrl}/pages?${params}`).pipe(
      tap({
        next: (res) => {
          this._tasks.set(res.items);
          this._loading.set(false);
        },
        error: () => this._loading.set(false)
      }),
      map(res => res.total)
    );
  }

  completeTask(id: number) {
    return this.http.put(`${this.baseUrl}/${id}`, { status: 'Completed' });
  }

  createTask(form: CreateTask) {
    return this.http.post(`${this.baseUrl}`, form);
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  editTask(id: number, form: UpdateTask) {
    return this.http.put(`${this.baseUrl}/${id}`, form);
  }
}
