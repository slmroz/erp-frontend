import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../core/config/config.service';
import { ProductDto, ProductDtoPagedResult, AddProductCommand, UpdateProductCommand } from './models';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private http: HttpClient, private config: ConfigService) { }

    getProducts(page: number = 1, pageSize: number = 20, search?: string, groupId?: number): Observable<ProductDtoPagedResult> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }
        if (groupId) {
            params = params.set('groupId', groupId.toString());
        }

        return this.http.get<ProductDtoPagedResult>(`${this.config.apiUrl}/Products`, { params });
    }

    getProduct(id: number): Observable<ProductDto> {
        return this.http.get<ProductDto>(`${this.config.apiUrl}/Products/${id}`);
    }

    addProduct(command: AddProductCommand): Observable<number> {
        return this.http.post<number>(`${this.config.apiUrl}/Products`, command);
    }

    updateProduct(id: number, command: UpdateProductCommand): Observable<void> {
        return this.http.put<void>(`${this.config.apiUrl}/Products/${id}`, command);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.config.apiUrl}/Products/${id}`);
    }
}
