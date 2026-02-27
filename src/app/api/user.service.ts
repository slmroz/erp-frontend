import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { UserDto, GetUsers, UpdateUserCommand, SignUpCommand, ResetPasswordCommand, ForgotPasswordCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private config = inject(ConfigService);

    getUsers(
        page: number = 1,
        pageSize: number = 20,
        search?: string,
        role?: number,
        sortBy?: string,
        sortOrder?: string
    ): Observable<UserDto[]> {
        let params = new HttpParams()
            .set('Page', page.toString())
            .set('PageSize', pageSize.toString());

        if (search) {
            params = params.set('Search', search);
        }
        if (role !== undefined && role !== null) {
            params = params.set('Role', role.toString());
        }
        if (sortBy) {
            params = params.set('SortBy', sortBy);
        }
        if (sortOrder) {
            params = params.set('SortOrder', sortOrder);
        }

        return this.http.get<UserDto[]>(`${this.config.apiUrl}/User`, { params });
    }

    getUser(id: number): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.config.apiUrl}/User/${id}`);
    }

    updateUser(id: number, command: UpdateUserCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/User/${id}`, command);
    }

    addUser(command: SignUpCommand): Observable<void> {
        return this.http.post<void>(`${this.config.apiUrl}/User/sign-up`, command);
    }

    forgotPassword(command: ForgotPasswordCommand): Observable<void> {
        return this.http.post<void>(`${this.config.apiUrl}/User/forgot-password`, command);
    }

    resetPassword(command: ResetPasswordCommand): Observable<void> {
        return this.http.post<void>(`${this.config.apiUrl}/User/reset-password`, command);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/User/${id}`);
    }
}
