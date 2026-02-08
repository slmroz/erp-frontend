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
import { merge, fromEvent, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '../../../api/customer.service';
import { CustomerDto } from '../../../api/models';
import { CustomerDialogComponent } from '../customer-dialog/customer-dialog.component';

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
        MatSnackBarModule
    ],
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements AfterViewInit {
    displayedColumns: string[] = ['name', 'taxId', 'city', 'country', 'www', 'actions'];
    data: CustomerDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(private customerService: CustomerService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

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
                    return this.customerService.getCustomers(
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
        if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
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
    }
}
