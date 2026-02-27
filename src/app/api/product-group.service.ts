import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { ProductGroupDto, ProductGroupDtoPagedResult, AddProductGroupCommand, UpdateProductGroupCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class ProductGroupService {
    private http = inject(HttpClient);

    constructor(private config: ConfigService) { }

    getProductGroups(
        page: number = 1,
        pageSize: number = 20,
        search?: string,
        sortBy?: string,
        sortOrder?: string
    ): Observable<ProductGroupDtoPagedResult> {
        let params = new HttpParams()
            .set('Page', page.toString())
            .set('PageSize', pageSize.toString());

        if (search) {
            params = params.set('Search', search);
        }
        if (sortBy) {
            params = params.set('SortBy', sortBy);
        }
        if (sortOrder) {
            params = params.set('SortOrder', sortOrder);
        }

        return this.http.get<ProductGroupDtoPagedResult>(`${this.config.apiUrl}/ProductGroups`, { params });
    }

    getProductGroup(id: number): Observable<ProductGroupDto> {
        return this.http.get<ProductGroupDto>(`${this.config.apiUrl}/ProductGroups/${id}`);
    }

    addProductGroup(command: AddProductGroupCommand): Observable<number> {
        return this.http.post<number>(`${this.config.apiUrl}/ProductGroups`, command);
    }

    updateProductGroup(id: number, command: UpdateProductGroupCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/ProductGroups/${id}`, command);
    }

    deleteProductGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/ProductGroups/${id}`);
    }
}
