import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { SignInCommand, JwtDto } from '../../api/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private config = inject(ConfigService);
    private router = inject(Router);

    private readonly TOKEN_KEY = 'auth_token';

    // State using Signals
    private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
    private _role = signal<number | null>(this.getRoleFromToken(localStorage.getItem(this.TOKEN_KEY)));
    private _email = signal<string | null>(this.getEmailFromToken(localStorage.getItem(this.TOKEN_KEY)));
    private _firstName = signal<string | null>(this.getNameFromToken(localStorage.getItem(this.TOKEN_KEY), 'firstName'));
    private _lastName = signal<string | null>(this.getNameFromToken(localStorage.getItem(this.TOKEN_KEY), 'lastName'));

    isAuthenticated = computed(() => !!this._token());
    token = computed(() => this._token());
    isAdmin = computed(() => this._role() === 2); // Role.Admin = 2
    userEmail = computed(() => this._email());
    userFullName = computed(() => {
        const first = this._firstName();
        const last = this._lastName();
        if (first && last) return `${first} ${last}`;
        return first || last || this._email() || 'User';
    });

    login(command: SignInCommand): Observable<JwtDto> {
        return this.http.post<JwtDto>(`${this.config.apiUrl}/User/sign-in`, command).pipe(
            tap(response => {
                if (response.accessToken) {
                    this.setToken(response.accessToken);
                }
            })
        );
    }

    logout() {
        this.removeToken();
        this.router.navigate(['/login']);
    }

    private setToken(token: string) {
        localStorage.setItem(this.TOKEN_KEY, token);
        this._token.set(token);
        this._role.set(this.getRoleFromToken(token));
        this._email.set(this.getEmailFromToken(token));
        this._firstName.set(this.getNameFromToken(token, 'firstName'));
        this._lastName.set(this.getNameFromToken(token, 'lastName'));
    }

    private removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
        this._token.set(null);
        this._role.set(null);
        this._email.set(null);
        this._firstName.set(null);
        this._lastName.set(null);
    }

    private getRoleFromToken(token: string | null): number | null {
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            // Check common claim names for role
            const role = decodedPayload.role ?? decodedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (!role) return null;

            // Handle string roles or numeric roles
            if (role === 'Admin' || role === 2 || role === '2') return 2;
            if (role === 'User' || role === 1 || role === '1') return 1;

            return Number(role);
        } catch (e) {
            return null;
        }
    }

    private getEmailFromToken(token: string | null): string | null {
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload.email ?? decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        } catch (e) {
            return null;
        }
    }

    private getNameFromToken(token: string | null, type: 'firstName' | 'lastName'): string | null {
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            if (type === 'firstName') {
                return decodedPayload.firstName ??
                    decodedPayload.given_name ??
                    decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
            } else {
                return decodedPayload.lastName ??
                    decodedPayload.family_name ??
                    decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];
            }
        } catch (e) {
            return null;
        }
    }
}
