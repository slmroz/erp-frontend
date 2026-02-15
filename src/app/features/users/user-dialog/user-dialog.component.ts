import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserDto, Role, UpdateUserCommand } from '../../../api/models';
import { UserService } from '../../../api/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Edit User</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Please enter a valid email</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option [value]="Role.User">User</mat-option>
            <mat-option [value]="Role.Admin">Admin</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || isSaving" (click)="save()">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
      min-width: 300px;
    }
  `]
})
export class UserDialogComponent {
  form: FormGroup;
  isSaving = false;
  Role = Role;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDto
  ) {
    this.form = this.fb.group({
      email: [data.email || '', [Validators.required, Validators.email]],
      firstName: [data.firstName || ''],
      lastName: [data.lastName || ''],
      role: [data.role || Role.User, Validators.required]
    });
  }

  save() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const command: UpdateUserCommand = {
      id: this.data.id,
      email: this.form.value.email,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      role: this.form.value.role
    };

    this.userService.updateUser(this.data.id, command).subscribe({
      next: () => {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }
}
