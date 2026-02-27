import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import {
    CurrencyDto,
    CurrencyDtoPagedResult,
    AddCurrencyCommand,
    UpdateCurrencyCommand,
    UpdateCurrencyListCommand
} from './models';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    constructor(private http: HttpClient, private config: ConfigService) { }

    getCurrencies(
        page: number = 1,
        pageSize: number = 20,
        baseCurrency?: string,
        targetCurrency?: string,
        refresh: boolean = false,
        sortBy?: string,
        sortOrder?: string
    ): Observable<CurrencyDtoPagedResult> {
        let params = new HttpParams()
            .set('Page', page.toString())
            .set('PageSize', pageSize.toString())
            .set('Refresh', refresh.toString());

        if (baseCurrency) {
            params = params.set('BaseCurrency', baseCurrency);
        }
        if (targetCurrency) {
            params = params.set('TargetCurrency', targetCurrency);
        }
        if (sortBy) {
            params = params.set('SortBy', sortBy);
        }
        if (sortOrder) {
            params = params.set('SortOrder', sortOrder);
        }

        return this.http.get<CurrencyDtoPagedResult>(`${this.config.apiUrl}/Currency`, { params });
    }

    getCurrency(id: number): Observable<CurrencyDto> {
        return this.http.get<CurrencyDto>(`${this.config.apiUrl}/Currency/${id}`);
    }

    addCurrency(command: AddCurrencyCommand): Observable<number> {
        return this.http.post<number>(`${this.config.apiUrl}/Currency`, command);
    }

    updateCurrency(id: number, command: UpdateCurrencyCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/Currency/${id}`, command);
    }

    deleteCurrency(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/Currency/${id}`);
    }

    refreshCurrencies(command: UpdateCurrencyListCommand = {}): Observable<void> {
        return this.http.post<void>(`${this.config.apiUrl}/Currency/Refresh`, command);
    }
}
