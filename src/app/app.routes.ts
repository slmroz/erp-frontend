import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { ContactListComponent } from './features/contacts/contact-list/contact-list.component';
import { ProductGroupListComponent } from './features/products/product-group-list/product-group-list.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { PasswordResetComponent } from './features/auth/password-reset/password-reset.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { CurrencyListComponent } from './features/catalog/currency-list/currency-list.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'users/passwordReset', component: PasswordResetComponent },
    { path: 'customers', component: CustomerListComponent, canActivate: [authGuard] },
    { path: 'contacts', component: ContactListComponent, canActivate: [authGuard] },
    { path: 'product-groups', component: ProductGroupListComponent, canActivate: [authGuard] },
    { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
    { path: 'currencies', component: CurrencyListComponent, canActivate: [authGuard] },
    { path: 'users', component: UserListComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: '**', redirectTo: '/customers' }
];
