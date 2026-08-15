import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UpdateUser, User } from '../../../../core/models/user.model';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialog],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  users = signal<User[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedRole = '';
  currentPage = signal(1);
  pageSize = signal(5);
  totalUsers = signal(0);
  totalPages = computed(() => Math.ceil(this.totalUsers() / this.pageSize()));
  usePagination = signal(true);
  
  private searchSubject = new Subject<string>();
  // Modal state
  showModal = signal(false);
  submitting = signal(false);
  modalMessage = '';
  userForm: FormGroup;

  userToDelete : number | null = null;
  showDeleteDialog = false;
  
  // Edit mode state
  isEditMode = signal(false);
  editingUserId: number | null = null;

 

  adminCount = computed(() => this.users().filter(u => u.role === 'Admin').length);
  userCount = computed(() => this.users().filter(u => u.role === 'User').length);

  constructor(private userService: UserService, 
    private fb: FormBuilder,
    private readonly destroyRef : DestroyRef
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['User', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsersPage();

    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(term => {
        this.loading.set(true);
        return this.userService.getUsersPages(this.currentPage(),this.pageSize(),term);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        this.users.set(res.items);
        this.totalUsers.set(res.total);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    })
  }
  loadUsersPage(page: number  = 1) {
    this.loading.set(true);
    this.usePagination.set(true);
    this.currentPage.set(page);

    this.userService.getUsersPages(page, this.pageSize(), this.searchTerm).subscribe({
      next: (res) => {
        this.users.set(res.items);
        this.totalUsers.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }


  nextPage() {
    if(this.currentPage() < this.totalPages()) {
      if (this.selectedRole) {
        this.loadRolePage(this.currentPage() + 1);
      } else {
        this.loadUsersPage(this.currentPage() + 1);
      }
    }
  }

  prevPage() {
    if(this.currentPage() > 1) {
      if (this.selectedRole) {
        this.loadRolePage(this.currentPage() - 1);
      } else {
        this.loadUsersPage(this.currentPage() - 1);
      }
    }
  }

  goToPage(page: number) {
    if(page>=1 && page<= this.totalPages()) {
      if (this.selectedRole) {
        this.loadRolePage(page);
      } else {
        this.loadUsersPage(page);
      }
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    if (this.selectedRole) {
      this.loadUsersByRole(this.selectedRole);
    } else {
      this.loadUsersPage(1);
    }
  }
  
  loadUsersByRole(role: string) {
    this.loading.set(true);
    this.usePagination.set(true);
    this.currentPage.set(1);
    this.userService.getUsersByRole(role).subscribe({
      next: (res: User[]) => {
        const allRoleUsers = Array.isArray(res) ? res : [];
        this.totalUsers.set(allRoleUsers.length);
        // Client-side pagination
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        this.users.set(allRoleUsers.slice(start, end));
        // Store all users for role pagination
        this._allRoleUsers = allRoleUsers;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRolePage(page: number) {
    this.currentPage.set(page);
    const start = (page - 1) * this.pageSize();
    const end = start + this.pageSize();
    this.users.set(this._allRoleUsers.slice(start, end));
  }

  private _allRoleUsers: User[] = [];

  onRoleFilterChange(role: string) {
    this.selectedRole = role;
    if (role === '') {
      this.loadUsersPage(1);
    } else {
      this.loadUsersByRole(role);
    }
  }

  openModal() {
    this.showModal.set(true);
    this.isEditMode.set(false);
    this.editingUserId = null;
    this.modalMessage = '';
    this.userForm.reset({ role: 'User' });
  }

  openEditModal(user: User) {
    this.showModal.set(true);
    this.isEditMode.set(true);
    this.editingUserId = user.id;
    this.modalMessage = '';
    this.userForm.patchValue({
      name: user.name,
      role: user.role,
      password: ''
    });
    // Make password optional for edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditMode.set(false);
    this.editingUserId = null;
    this.modalMessage = '';
    // Restore password validators
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  submitForm() {
    if (this.userForm.invalid) return;
    
    this.submitting.set(true);
    
    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    this.userService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.modalMessage = 'User created successfully!';
        this.submitting.set(false);
        this.loadUsersPage(this.currentPage());
        setTimeout(() => this.closeModal(), 1500);
      },
      error: () => {
        this.modalMessage = 'Failed to create user';
        this.submitting.set(false);
      }
    });
  }

  updateUser() {
    const formData: UpdateUser = {
      name: this.userForm.value.name,
      role: this.userForm.value.role
    };
    
    // Only include password if it was changed
    if (this.userForm.value.password) {
      formData.password = this.userForm.value.password;
    }
    
    this.userService.updateUser(this.editingUserId!, formData).subscribe({
      next: () => {
        this.modalMessage = 'User updated successfully!';
        this.submitting.set(false);
        this.loadUsersPage(this.currentPage());
        setTimeout(() => this.closeModal(), 1500);
      },
      error: () => {
        this.modalMessage = 'Failed to update user';
        this.submitting.set(false);
      }
    });
  }

  deleteUser(id: number) {
    this.userToDelete = id;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if(this.userToDelete !== null) {
      this.userService.deleteUser(this.userToDelete).subscribe(() => {
        this.loadUsersPage();
      });
      this.userToDelete = null;
    }
    this.showDeleteDialog = false;
  }

  cancelDelete() {
    this.userToDelete = null;
    this.showDeleteDialog = false;
  }

  getRoleBadgeClass(role: string): string {
    return role === 'Admin' ? 'role-badge--admin' : 'role-badge--user';
  }
}
