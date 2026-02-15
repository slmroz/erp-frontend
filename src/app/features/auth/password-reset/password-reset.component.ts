import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../api/user.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordMismatch: true }
        : null;
};

@Component({
    selector: 'app-password-reset',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './password-reset.component.html',
    styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    token = signal<string | null>(null);
    isLoading = signal(false);
    hidePassword = signal(true);
    hideConfirmPassword = signal(true);

    resetForm = this.fb.group({
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

    ngOnInit() {
        this.token.set(this.route.snapshot.queryParamMap.get('token'));
        if (!this.token()) {
            this.snackBar.open('Invalid reset token. Please request a new link.', 'Close', { duration: 5000 });
            this.router.navigate(['/login']);
        }
    }

    onSubmit() {
        if (this.resetForm.valid && this.token()) {
            this.isLoading.set(true);
            const command = {
                token: this.token(),
                newPassword: this.resetForm.value.newPassword!
            };

            this.userService.resetPassword(command).subscribe({
                next: () => {
                    this.snackBar.open('Password reset successful! You can now log in.', 'Close', { duration: 3000 });
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.snackBar.open('Failed to reset password. The link may have expired.', 'Close', { duration: 5000 });
                }
            });
        }
    }
}
