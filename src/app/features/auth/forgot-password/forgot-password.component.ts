import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../api/user.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    forgotPasswordForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = signal(false);
    isSubmitted = signal(false);

    onSubmit() {
        if (this.forgotPasswordForm.valid) {
            this.isLoading.set(true);
            const command = {
                email: this.forgotPasswordForm.value.email!
            };

            this.userService.forgotPassword(command).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.isSubmitted.set(true);
                    this.snackBar.open('If an account exists with that email, a reset link has been sent.', 'Close', { duration: 5000 });
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.snackBar.open('Service temporarily unavailable. Please try again later.', 'Close', { duration: 5000 });
                }
            });
        }
    }
}
