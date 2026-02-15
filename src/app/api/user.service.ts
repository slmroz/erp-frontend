import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { UserDto, GetUsers, UpdateUserCommand, ResetPasswordCommand, ForgotPasswordCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private config = inject(ConfigService);

    getUsers(query?: GetUsers): Observable<UserDto[]> {
        let params = new HttpParams();
        if (query) {
            Object.keys(query).forEach(key => {
                if (query[key] !== undefined && query[key] !== null) {
                    params = params.set(key, query[key]);
                }
            });
        }
        return this.http.get<UserDto[]>(`${this.config.apiUrl}/User`, { params });
    }

    getUser(id: number): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.config.apiUrl}/User/${id}`);
    }

    updateUser(id: number, command: UpdateUserCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/User/${id}`, command);
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
