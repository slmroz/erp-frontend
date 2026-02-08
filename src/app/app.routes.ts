import { Routes } from '@angular/router';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';

export const routes: Routes = [
    { path: 'customers', component: CustomerListComponent },
    { path: 'users', component: UserListComponent },
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: '**', redirectTo: '/customers' }
];
