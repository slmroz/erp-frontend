import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductGroupService } from '../../../api/product-group.service';
import { ProductGroupDto, AddProductGroupCommand, UpdateProductGroupCommand } from '../../../api/models';

@Component({
    selector: 'app-product-group-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './product-group-dialog.component.html',
    styles: [`
        .product-group-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 400px;
            padding-top: 16px;
        }
    `]
})
export class ProductGroupDialogComponent implements OnInit {
    form: FormGroup;
    isEditMode: boolean;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private productGroupService: ProductGroupService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<ProductGroupDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ProductGroupDto | null
    ) {
        this.isEditMode = !!data;
        this.form = this.fb.group({
            name: [data?.name || '', [Validators.required]],
            description: [data?.description || '']
        });
    }

    ngOnInit() { }

    save() {
        if (this.form.invalid) return;

        this.isSaving = true;
        if (this.isEditMode) {
            const command: UpdateProductGroupCommand = {
                id: this.data!.id,
                ...this.form.value
            };
            this.productGroupService.updateProductGroup(this.data!.id, command).subscribe({
                next: () => {
                    this.snackBar.open('Product group updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update product group', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        } else {
            const command: AddProductGroupCommand = {
                ...this.form.value
            };
            this.productGroupService.addProductGroup(command).subscribe({
                next: () => {
                    this.snackBar.open('Product group created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to create product group', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }
}
