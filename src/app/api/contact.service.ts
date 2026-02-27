import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { ContactDto, ContactDtoPagedResult, AddContactCommand, UpdateContactCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    constructor(private http: HttpClient, private config: ConfigService) { }

    getContacts(
        page: number = 1,
        pageSize: number = 20,
        search?: string,
        customerId?: number,
        sortBy?: string,
        sortOrder?: string
    ): Observable<ContactDtoPagedResult> {
        let params = new HttpParams()
            .set('Page', page.toString())
            .set('PageSize', pageSize.toString());

        if (search) {
            params = params.set('Search', search);
        }
        if (customerId) {
            params = params.set('CustomerId', customerId.toString());
        }
        if (sortBy) {
            params = params.set('SortBy', sortBy);
        }
        if (sortOrder) {
            params = params.set('SortOrder', sortOrder);
        }

        return this.http.get<ContactDtoPagedResult>(`${this.config.apiUrl}/contacts`, { params });
    }

    getContactById(id: number): Observable<ContactDto> {
        return this.http.get<ContactDto>(`${this.config.apiUrl}/contacts/${id}`);
    }

    addContact(command: AddContactCommand): Observable<number> {
        return this.http.post<number>(`${this.config.apiUrl}/contacts`, command);
    }

    updateContact(id: number, command: UpdateContactCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/contacts/${id}`, command);
    }

    deleteContact(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/contacts/${id}`);
    }
}
