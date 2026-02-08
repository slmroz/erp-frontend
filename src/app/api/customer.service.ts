import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { CustomerDto, CustomerDtoPagedResult, AddCustomerCommand, UpdateCustomerCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private http = inject(HttpClient);
    private configService = inject(ConfigService);

    private get apiUrl(): string {
        return this.configService.apiUrl;
    }

    getCustomers(page: number = 1, pageSize: number = 20, search?: string): Observable<CustomerDtoPagedResult> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<CustomerDtoPagedResult>(`${this.apiUrl}/Customers`, { params });
    }

    getCustomer(id: number): Observable<CustomerDto> {
        return this.http.get<CustomerDto>(`${this.apiUrl}/Customers/${id}`);
    }

    addCustomer(command: AddCustomerCommand): Observable<number> {
        return this.http.post<number>(`${this.apiUrl}/Customers`, command);
    }

    updateCustomer(id: number, command: UpdateCustomerCommand): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/Customers/${id}`, command);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/Customers/${id}`);
    }
}
