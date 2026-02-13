import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
    { path: 'users', component: UserListComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: '**', redirectTo: '/customers' }
];
