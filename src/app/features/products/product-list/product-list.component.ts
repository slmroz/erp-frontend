import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { merge, fromEvent, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../api/product.service';
import { ProductDto } from '../../../api/models';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['name', 'groupName', 'partNumber', 'listPrice', 'actions'];
    data: ProductDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;
    groupId?: number;
    groupName?: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private productService: ProductService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['groupId']) {
                this.groupId = +params['groupId'];
                this.groupName = params['groupName'];
                this.refreshTable();
            }
        });
    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
            )
            .subscribe(() => {
                this.paginator.pageIndex = 0;
                this.refreshTable();
            });

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.productService.getProducts(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        this.input.nativeElement.value,
                        this.groupId
                    ).pipe(catchError(() => of(null)));
                }),
                map(data => {
                    this.isLoadingResults = false;

                    if (data === null) {
                        return [];
                    }

                    this.resultsLength = data.totalCount;
                    return data.items || [];
                })
            )
            .subscribe(data => (this.data = data));
    }

    refreshTable() {
        if (this.paginator) {
            this.paginator.page.emit();
        }
    }

    addProduct() {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '600px',
            data: this.groupId ? { productGroupId: this.groupId } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    editProduct(product: ProductDto) {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '600px',
            data: product
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    deleteProduct(product: ProductDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Product',
                message: `Are you sure you want to delete product "${product.name}"?`,
                confirmText: 'Delete',
                confirmColor: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.productService.deleteProduct(product.id).subscribe({
                    next: () => {
                        this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
                        this.refreshTable();
                    },
                    error: (err) => {
                        this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
                        console.error(err);
                    }
                });
            }
        });
    }

    clearGroupFilter() {
        this.groupId = undefined;
        this.groupName = undefined;
        this.refreshTable();
    }
}
