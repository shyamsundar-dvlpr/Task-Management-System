import { Component } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.form.invalid) return;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const route = this.authService.role() === 'Admin' ? '/users' : '/my-tasks';
        this.router.navigate([route]);
      },
      error: () => this.error = 'Invalid username or password'
    });
  } 
}
