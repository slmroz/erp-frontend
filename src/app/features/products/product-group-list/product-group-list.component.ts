import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { merge, fromEvent, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductGroupService } from '../../../api/product-group.service';
import { ProductGroupDto } from '../../../api/models';
import { ProductGroupDialogComponent } from '../product-group-dialog/product-group-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-product-group-list',
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
        MatProgressSpinnerModule
    ],
    templateUrl: './product-group-list.component.html',
    styleUrls: ['./product-group-list.component.scss']
})
export class ProductGroupListComponent implements AfterViewInit {
    displayedColumns: string[] = ['name', 'description', 'productCount', 'actions'];
    data: ProductGroupDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private productGroupService: ProductGroupService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

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
                    return this.productGroupService.getProductGroups(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        this.input.nativeElement.value
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

    addProductGroup() {
        const dialogRef = this.dialog.open(ProductGroupDialogComponent, {
            width: '600px',
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    editProductGroup(group: ProductGroupDto) {
        const dialogRef = this.dialog.open(ProductGroupDialogComponent, {
            width: '600px',
            data: group
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    deleteProductGroup(group: ProductGroupDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Product Group',
                message: `Are you sure you want to delete product group "${group.name}"?`,
                confirmText: 'Delete',
                confirmColor: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.productGroupService.deleteProductGroup(group.id).subscribe({
                    next: () => {
                        this.snackBar.open('Product group deleted', 'Close', { duration: 3000 });
                        this.refreshTable();
                    },
                    error: (err) => {
                        this.snackBar.open('Error deleting product group', 'Close', { duration: 3000 });
                        console.error(err);
                    }
                });
            }
        });
    }

    goToProducts(group: ProductGroupDto) {
        this.router.navigate(['/products'], {
            queryParams: {
                groupId: group.id,
                groupName: group.name
            }
        });
    }
}
