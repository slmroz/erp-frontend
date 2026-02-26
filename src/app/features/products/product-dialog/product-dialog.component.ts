import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../api/product.service';
import { ProductGroupService } from '../../../api/product-group.service';
import { ProductDto, ProductGroupDto, AddProductCommand, UpdateProductCommand } from '../../../api/models';

@Component({
    selector: 'app-product-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './product-dialog.component.html',
    styles: [`
        .product-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 500px;
            padding-top: 16px;
        }
        .form-row {
            display: flex;
            gap: 16px;
        }
        .form-row mat-form-field {
            flex: 1;
        }
    `]
})
export class ProductDialogComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;
    isSaving = false;
    groups: ProductGroupDto[] = [];

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private groupService: ProductGroupService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<ProductDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isEditMode = data && data.id !== undefined;
        this.form = this.fb.group({
            name: [data?.name || '', [Validators.required]],
            productGroupId: [data?.productGroupId || '', [Validators.required]],
            partNumber: [data?.partNumber || ''],
            description: [data?.description || ''],
            oemBrand: [data?.oemBrand || ''],
            listPrice: [data?.listPrice || 0, [Validators.min(0)]],
            weightKg: [data?.weightKg || 0, [Validators.min(0)]]
        });
    }

    ngOnInit() {
        this.loadGroups();
    }

    loadGroups() {
        this.groupService.getProductGroups(1, 100).subscribe({
            next: (result) => {
                this.groups = result.items || [];
            },
            error: (err) => {
                this.snackBar.open('Failed to load product groups', 'Close', { duration: 3000 });
                console.error(err);
            }
        });
    }

    save() {
        if (this.form.invalid) return;

        this.isSaving = true;
        if (this.isEditMode) {
            const command: UpdateProductCommand = {
                id: this.data.id,
                ...this.form.value
            };
            this.productService.updateProduct(this.data.id, command).subscribe({
                next: () => {
                    this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        } else {
            const command: AddProductCommand = {
                ...this.form.value
            };
            this.productService.addProduct(command).subscribe({
                next: () => {
                    this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to create product', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }
}
