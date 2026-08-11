import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

// Auth guard - redirects to login if not authenticated
const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

// Admin guard - only allows admin role
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.role() === 'Admin') {
    return true;
  }
  return router.createUrlTree(['/my-tasks']);
};

const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    const destination = authService.role() === 'Admin' ? '/users' : '/my-tasks';
    return router.createUrlTree([destination]);
  }
  return true;
}

export const routes: Routes = [
  { path: '**', canActivate: [loginGuard], loadComponent: () => import('./features/auth/login/logincomponent/logincomponent').then(m => m.Logincomponent) },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/logincomponent/logincomponent').then(m => m.Logincomponent),
    canActivate: [loginGuard]
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./features/tasks/my-tasks/my-tasks/my-tasks').then(m=>m.MyTasks),
    canActivate: [authGuard]
  },
  {
    path: 'create-task',
    loadComponent: () => import('./features/tasks/create-task/create-task/create-task').then(m=>m.CreateTask),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./features/admin/user-list/user-list/user-list').then(m=>m.UserList),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
