import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface AppConfig {
    apiUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config = signal<AppConfig | null>(null);

    constructor(private http: HttpClient) { }

    async loadConfig(): Promise<void> {
        try {
            const config = await lastValueFrom(this.http.get<AppConfig>('/settings.json'));
            this.config.set(config);
        } catch (error) {
            console.error('Failed to load configuration', error);
            // Fallback or rethrow
            this.config.set({ apiUrl: 'http://localhost:5000' });
        }
    }

    get apiUrl(): string {
        return this.config()?.apiUrl || '';
    }
}
