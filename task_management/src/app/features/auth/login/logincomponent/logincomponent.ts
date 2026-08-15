import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logincomponent',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.scss',
})
export class Logincomponent {
  error: string = '';
  form;
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const route = this.authService.role() === 'Admin' ? '/users' : '/my-tasks';
        this.router.navigate([route]);
      },
      error: () => {
        this.error = 'Invalid username or password';
        this.submitting.set(false);
      }
    });
  } 
}
