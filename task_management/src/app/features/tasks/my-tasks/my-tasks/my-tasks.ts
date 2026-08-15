import { Component, computed, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, ConfirmDialog, ReactiveFormsModule],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.scss',
})
export class MyTasks {
  showAllTasks = false;
  showDeleteDialog = false;
  taskToDelete: number | null = null;

  // Edit modal state
  showEditModal = signal(false);
  editingTaskId: number | null = null;
  editForm: FormGroup;
  users = signal<User[]>([]);
  submitting = signal(false);
  editMessage = '';

  currentPage=signal(1);
  pageSize = signal(5);
  totalTasks = signal(0);
  totalPages = computed(() => Math.ceil(this.totalTasks() / this.pageSize()));
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    public taskService: TaskService, 
    public authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly destroyRef : DestroyRef
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedUserId: [null, Validators.required],
      status: ['Pending', Validators.required],
      priority: ['Low', Validators.required],
      dueDate: [null]
    });
  }

  pendingCount = computed(() => 
    this.taskService.tasks().filter(t => t.status === 'Pending').length
  );

  completedCount = computed(() => 
    this.taskService.tasks().filter(t => t.status === 'Completed').length
  );

  ngOnInit() {
    this.loadTasksPage(1);
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(term => this.taskService.loadTasksPage(this.currentPage(), this.pageSize(), term)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (total) => {
        this.totalTasks.set(total);
        this.currentPage.set(1);
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res: User[]) => this.users.set(res),
      error: () => {}
    });
  }

  loadTasksPage(page: number = 1) {
    this.currentPage.set(page);
    this.taskService.loadTasksPage(page, this.pageSize(), this.searchTerm).subscribe({
      next: (total) => this.totalTasks.set(total)
    });
  }
  onSearch(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  openEditModal(task: Task) {
    this.editingTaskId = task.id;
    this.editMessage = '';
    this.editForm.patchValue({
      title: task.title,
      description: task.description || '',
      assignedUserId: task.assignedUserId,
      status: task.status,
      priority: task.priority || 'Low',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : null
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingTaskId = null;
    this.editMessage = '';
  }

  submitEdit() {
    if (this.editForm.invalid || !this.editingTaskId) return;
    
    this.submitting.set(true);
    this.taskService.editTask(this.editingTaskId, this.editForm.value).subscribe({
      next: () => {
        this.editMessage = 'Task updated successfully!';
        this.submitting.set(false);
        if (this.showAllTasks) {
          this.loadTasksPage(this.currentPage());
        } else {
          this.taskService.loadMyTasks();
        }
        setTimeout(() => this.closeEditModal(), 1500);
      },
      error: () => {
        this.editMessage = 'Failed to update task';
        this.submitting.set(false);
      }
    });
  }

  toggleView() {
    this.showAllTasks = !this.showAllTasks;
    this.currentPage.set(1);
    this.totalTasks.set(0);
    if(this.showAllTasks) {
      this.loadTasksPage(1);
    }
    else {
      this.taskService.loadMyTasks();
    }
  }

  nextPage() {
    if(this.currentPage()<this.totalPages()) {
      this.loadTasksPage(this.currentPage() + 1);
    }
  }

  prevPage() {
    if(this.currentPage()>1) {
      this.loadTasksPage(this.currentPage() - 1);
    }
  }

  complete(id: number) {
    this.taskService.completeTask(id).subscribe(() => {
      if(this.showAllTasks) this.loadTasksPage(this.currentPage());
      else this.taskService.loadMyTasks();
    })
  }

  delete(id: number) {
    this.taskToDelete = id;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if (this.taskToDelete !== null) {
      this.taskService.deleteTask(this.taskToDelete).subscribe(() => {
        if (this.showAllTasks) this.loadTasksPage(this.currentPage());
        else this.taskService.loadMyTasks();
      });
      this.taskToDelete = null;
    }
    this.showDeleteDialog = false;
  }

  cancelDelete() {
    this.taskToDelete = null;
    this.showDeleteDialog = false;
  }

  createTask() {
    this.router.navigate(['/create-task']);
  }

  priorityClass(priority: unknown): string {
    return typeof priority === 'string' ? priority.toLowerCase() : 'low';
  }
}
