import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyService } from '../../../api/currency.service';
import { AddCurrencyCommand, UpdateCurrencyCommand } from '../../../api/models';

@Component({
    selector: 'app-currency-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './currency-dialog.component.html',
    styles: [`
        .currency-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 400px;
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
export class CurrencyDialogComponent {
    form: FormGroup;
    isEditMode: boolean;
    isSaving = false;

    constructor(
        private fb: FormBuilder,
        private currencyService: CurrencyService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<CurrencyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isEditMode = data && data.id !== undefined;
        this.form = this.fb.group({
            baseCurrency: [data?.baseCurrency || '', [Validators.required]],
            targetCurrency: [data?.targetCurrency || '', [Validators.required]],
            rate: [data?.rate || 0, [Validators.required, Validators.min(0)]]
        });
    }

    save() {
        if (this.form.invalid) return;

        this.isSaving = true;
        if (this.isEditMode) {
            const command: UpdateCurrencyCommand = {
                id: this.data.id,
                ...this.form.value
            };
            this.currencyService.updateCurrency(this.data.id, command).subscribe({
                next: () => {
                    this.snackBar.open('Currency updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update currency', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        } else {
            const command: AddCurrencyCommand = {
                ...this.form.value
            };
            this.currencyService.addCurrency(command).subscribe({
                next: () => {
                    this.snackBar.open('Currency created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to create currency', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }
}
