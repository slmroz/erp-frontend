import { Component, OnInit, ViewChild, AfterViewInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../api/user.service';
import { UserDto } from '../../../api/models';

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
        MatButtonModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
    private userService = inject(UserService);

    displayedColumns: string[] = ['id', 'email', 'actions'];
    dataSource = new MatTableDataSource<UserDto>([]);

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
}
