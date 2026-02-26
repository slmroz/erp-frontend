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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { merge, of, fromEvent } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { CurrencyService } from '../../../api/currency.service';
import { CurrencyDto } from '../../../api/models';
import { CurrencyDialogComponent } from '../currency-dialog/currency-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-currency-list',
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
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './currency-list.component.html',
    styleUrls: ['./currency-list.component.scss']
})
export class CurrencyListComponent implements AfterViewInit {
    displayedColumns: string[] = ['baseCurrency', 'targetCurrency', 'rate', 'lastUpdatedAt', 'actions'];
    data: CurrencyDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;
    isRefreshing = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('targetFilter') targetFilter!: ElementRef;

    constructor(
        private currencyService: CurrencyService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        const filterEvent = fromEvent(this.targetFilter.nativeElement, 'keyup').pipe(
            debounceTime(150),
            distinctUntilChanged(),
            tap(() => (this.paginator.pageIndex = 0))
        );

        merge(this.sort.sortChange, this.paginator.page, filterEvent)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    const refreshParam = this.isRefreshing;
                    this.isRefreshing = false;

                    return this.currencyService.getCurrencies(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        undefined,
                        this.targetFilter.nativeElement.value,
                        refreshParam,
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
                    return data.items || [];
                })
            )
            .subscribe(data => (this.data = data));
    }

    refreshData() {
        this.isRefreshing = true;
        this.paginator.pageIndex = 0;
        this.refreshTable();
    }

    refreshTable() {
        if (this.paginator) {
            this.paginator.page.emit();
        }
    }

    addCurrency() {
        const dialogRef = this.dialog.open(CurrencyDialogComponent, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    editCurrency(currency: CurrencyDto) {
        const dialogRef = this.dialog.open(CurrencyDialogComponent, {
            width: '500px',
            data: currency
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    deleteCurrency(currency: CurrencyDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Currency',
                message: `Are you sure you want to delete exchange rate for ${currency.baseCurrency}/${currency.targetCurrency}?`,
                confirmText: 'Delete',
                confirmColor: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.currencyService.deleteCurrency(currency.id).subscribe({
                    next: () => {
                        this.snackBar.open('Currency deleted', 'Close', { duration: 3000 });
                        this.refreshTable();
                    },
                    error: (err) => {
                        this.snackBar.open('Error deleting currency', 'Close', { duration: 3000 });
                        console.error(err);
                    }
                });
            }
        });
    }
}
