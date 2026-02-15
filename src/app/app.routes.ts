import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { PasswordResetComponent } from './features/auth/password-reset/password-reset.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'users/passwordReset', component: PasswordResetComponent },
    { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
    { path: 'users', component: UserListComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: '**', redirectTo: '/customers' }
];
