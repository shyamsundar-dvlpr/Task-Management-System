import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../../core/services/task.service';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-create-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-task.html',
  styleUrl: './create-task.scss',
})
export class CreateTask implements OnInit {
  message = '';
  form: FormGroup;
  users = signal<User[]>([]);
  loadingUsers = signal(false);

  constructor(
    private fb: FormBuilder, 
    private taskService: TaskService, 
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedUserId: [null, Validators.required],
      priority: ['Low', Validators.required],
      dueDate: [null]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loadingUsers.set(false);
      },
      error: () => this.loadingUsers.set(false)
    });
  }

  create() {
    if (this.form.invalid) return;
    this.taskService.createTask(this.form.value).subscribe({
      next: () => {
        this.message = 'Task created successfully!';
        this.form.reset();
      },
      error: (err) => {
        this.message = 'Failed to create task';
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/my-tasks']);
  }
}
