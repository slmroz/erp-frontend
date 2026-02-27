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
import { MatTooltipModule } from '@angular/material/tooltip';
import { merge, fromEvent, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerService } from '../../../api/customer.service';
import { CustomerDto } from '../../../api/models';
import { CustomerDialogComponent } from '../customer-dialog/customer-dialog.component';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements AfterViewInit {
    displayedColumns: string[] = ['name', 'taxId', 'address', 'city', 'country', 'www', 'actions'];
    data: CustomerDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private customerService: CustomerService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        const searchEvent = fromEvent(this.input.nativeElement, 'keyup').pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => {
                this.paginator.pageIndex = 0;
            })
        );

        merge(this.sort.sortChange, this.paginator.page, searchEvent)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.customerService.getCustomers(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        this.input.nativeElement.value,
                        this.sort.active,
                        this.sort.direction
                    ).pipe(catchError(() => of(null)));
                }),
                map(data => {
                    this.isLoadingResults = false;

                    if (data === null) {
                        return [];
                    }

                    this.resultsLength = data.totalCount;
                    const items = data.items || [];

                    // Robust mapping for preview in list (handle both casings)
                    return items.map((item: any) => ({
                        ...item,
                        name: item.name || item.Name,
                        taxId: item.taxId || item.TaxId,
                        address: item.address || item.Address,
                        zipCode: item.zipCode || item.ZipCode,
                        city: item.city || item.City,
                        country: item.country || item.Country,
                        www: item.www || item.Www,
                        facebook: item.facebook || item.Facebook
                    }));
                })
            )
            .subscribe(data => (this.data = data));
    }

    refreshTable() {
        // Hack to trigger merge pipe
        this.paginator.page.emit();
    }

    addCustomer() {
        const dialogRef = this.dialog.open(CustomerDialogComponent, {
            width: '600px',
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    editCustomer(customer: CustomerDto) {
        const dialogRef = this.dialog.open(CustomerDialogComponent, {
            width: '600px',
            data: customer
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    deleteCustomer(customer: CustomerDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Customer',
                message: `Are you sure you want to delete ${customer.name}?`,
                confirmText: 'Delete',
                confirmColor: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.customerService.deleteCustomer(customer.id).subscribe({
                    next: () => {
                        this.snackBar.open('Customer deleted', 'Close', { duration: 3000 });
                        this.refreshTable();
                    },
                    error: (err) => {
                        this.snackBar.open('Error deleting customer', 'Close', { duration: 3000 });
                        console.error(err);
                    }
                });
            }
        });
    }

    goToContacts(customer: CustomerDto) {
        this.router.navigate(['/contacts'], {
            queryParams: {
                customerId: customer.id,
                customerName: customer.name
            }
        });
    }
}
