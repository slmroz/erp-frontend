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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { merge, fromEvent, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContactService } from '../../../api/contact.service';
import { ContactDto } from '../../../api/models';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';

@Component({
    selector: 'app-contact-list',
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
        MatProgressSpinnerModule
    ],
    templateUrl: './contact-list.component.html',
    styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phoneNo', 'customerName', 'actions'];
    data: ContactDto[] = [];
    resultsLength = 0;
    isLoadingResults = true;
    customerId?: number;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private contactService: ContactService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['customerId']) {
                this.customerId = +params['customerId'];
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
                    return this.contactService.getContacts(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        this.input.nativeElement.value,
                        this.customerId
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

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        // Debouncing is already handled by fromEvent logic in ngAfterViewInit
    }

    refreshTable() {
        if (this.paginator) {
            this.paginator.page.emit();
        }
    }

    addContact() {
        const dialogRef = this.dialog.open(ContactDialogComponent, {
            width: '600px',
            data: this.customerId ? { customerId: this.customerId } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    editContact(contact: ContactDto) {
        const dialogRef = this.dialog.open(ContactDialogComponent, {
            width: '600px',
            data: contact
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshTable();
            }
        });
    }

    deleteContact(contact: ContactDto) {
        if (confirm(`Are you sure you want to delete contact ${contact.firstName} ${contact.lastName}?`)) {
            this.contactService.deleteContact(contact.id).subscribe({
                next: () => {
                    this.snackBar.open('Contact deleted', 'Close', { duration: 3000 });
                    this.refreshTable();
                },
                error: (err) => {
                    this.snackBar.open('Error deleting contact', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }

    clearCustomerFilter() {
        this.customerId = undefined;
        this.refreshTable();
    }
}
