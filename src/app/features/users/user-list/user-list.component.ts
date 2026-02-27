import { Component, OnInit, ViewChild, AfterViewInit, inject, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { merge, of, fromEvent } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../api/user.service';
import { UserDto, Role } from '../../../api/models';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
    private userService = inject(UserService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    displayedColumns: string[] = ['id', 'email', 'firstName', 'lastName', 'role', 'actions'];
    dataSource = new MatTableDataSource<UserDto>([]);
    resultsLength = 0;
    isLoadingResults = true;
    Role = Role;

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('input') input!: ElementRef;

    constructor() { }

    ngOnInit() { }

    ngAfterViewInit() {
        // If the user changes the sort order, reset back to the first page.
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
                    return this.userService.getUsers(
                        this.paginator.pageIndex + 1,
                        this.paginator.pageSize,
                        this.input.nativeElement.value,
                        undefined, // Role filter could be added here if needed
                        this.sort.active,
                        this.sort.direction
                    ).pipe(catchError(() => of(null)));
                }),
                map(data => {
                    this.isLoadingResults = false;

                    if (data === null) {
                        return [];
                    }

                    // Since API returns UserDto[] instead of PagedResult, 
                    // we don't know the actual total length. 
                    // We'll set it to something or just show what we have.
                    this.resultsLength = data.length; // This is a limitation if not returned by API
                    return data;
                })
            )
            .subscribe(data => (this.dataSource.data = data));
    }

    loadUsers() {
        // This triggers the merge stream above
        this.paginator.page.emit();
    }

    applyFilter(event: Event) {
        // Handled by fromEvent in ngAfterViewInit
    }

    addUser() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            data: null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadUsers();
            }
        });
    }

    editUser(user: UserDto) {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '400px',
            data: user
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadUsers();
            }
        });
    }

    deleteUser(user: UserDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete User',
                message: `Are you sure you want to delete user ${user.email}?`,
                confirmText: 'Delete',
                confirmColor: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.deleteUser(user.id).subscribe({
                    next: () => {
                        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
                        this.loadUsers();
                    },
                    error: (err) => {
                        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
                        console.error(err);
                    }
                });
            }
        });
    }

    getRoleName(role: number | Role | null | undefined): string {
        if (role === Role.Admin) return 'Admin';
        if (role === Role.User) return 'User';
        return 'Unknown';
    }
}
