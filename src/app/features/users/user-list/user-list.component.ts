import { Component, OnInit, ViewChild, AfterViewInit, inject, signal, effect } from '@angular/core';
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
import { UserService } from '../../../api/user.service';
import { UserDto, Role } from '../../../api/models';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

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
        MatSnackBarModule
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
    Role = Role;

    users = signal<UserDto[]>([]);
    isLoading = signal<boolean>(true);

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor() {
        effect(() => {
            this.dataSource.data = this.users();
        });
    }

    ngOnInit() {
        this.loadUsers();
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    loadUsers() {
        this.isLoading.set(true);
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load users', err);
                this.isLoading.set(false);
            }
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
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
        if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
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
    }

    getRoleName(role: number | Role | null | undefined): string {
        if (role === Role.Admin) return 'Admin';
        if (role === Role.User) return 'User';
        return 'Unknown';
    }
}
