import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { UserDto, GetUsers } from './models';

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

    updateUser(id: number, user: UserDto): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/User/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/User/${id}`);
    }
}
