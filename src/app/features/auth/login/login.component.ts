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
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-login',
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
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    isLoading = signal(false);
    hidePassword = signal(true);

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            const credentials = {
                email: this.loginForm.value.email,
                password: this.loginForm.value.password
            };

            this.authService.login(credentials).subscribe({
                next: () => {
                    this.router.navigate(['/customers']);
                    this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
