import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CustomerDto, AddCustomerCommand, UpdateCustomerCommand } from '../../../api/models';
import { CustomerService } from '../../../api/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Customer' : 'Add Customer' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="customer-form">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tax ID</mat-label>
          <input matInput formControlName="taxId">
        </mat-form-field>

        <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Zip Code</mat-label>
              <input matInput formControlName="zipCode">
            </mat-form-field>
        </div>

        <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country">
            </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Website (WWW)</mat-label>
          <input matInput formControlName="www">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Facebook</mat-label>
          <input matInput formControlName="facebook">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || isSaving" (click)="save()">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
      min-width: 400px;
    }
    .row {
        display: flex;
        gap: 16px;
        mat-form-field {
            flex: 1;
        }
    }
  `]
})
export class CustomerDialogComponent {
  form: FormGroup;
  isEdit: boolean;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any | null
  ) {
    this.isEdit = !!data;

    // Fallback mapping for data from list (might be camelCase or PascalCase)
    const initialData = data ? {
      name: data.name || data.Name || '',
      taxId: data.taxId || data.TaxId || '',
      address: data.address || data.Address || '',
      zipCode: data.zipCode || data.ZipCode || '',
      city: data.city || data.City || '',
      country: data.country || data.Country || '',
      www: data.www || data.Www || '',
      facebook: data.facebook || data.Facebook || ''
    } : null;

    this.form = this.fb.group({
      name: [initialData?.name || '', Validators.required],
      taxId: [initialData?.taxId || ''],
      address: [initialData?.address || ''],
      zipCode: [initialData?.zipCode || ''],
      city: [initialData?.city || ''],
      country: [initialData?.country || ''],
      www: [initialData?.www || ''],
      facebook: [initialData?.facebook || '']
    });
  }

  ngOnInit() {
    if (this.isEdit && this.data?.id) {
      this.form.disable();
      this.customerService.getCustomer(this.data.id).subscribe({
        next: (details: any) => {
          // Robust mapping for detail response (handle both casings)
          const mapped = {
            name: details.name || details.Name,
            taxId: details.taxId || details.TaxId,
            address: details.address || details.Address,
            zipCode: details.zipCode || details.ZipCode,
            city: details.city || details.City,
            country: details.country || details.Country,
            www: details.www || details.Www,
            facebook: details.facebook || details.Facebook
          };
          this.form.patchValue(mapped);
          this.form.enable();
        },
        error: () => {
          this.form.enable();
          this.snackBar.open('Error loading customer details', 'Close', { duration: 3000 });
        }
      });
    }
  }

  save() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const formValue = this.form.value;

    if (this.isEdit && this.data) {
      const command: UpdateCustomerCommand = { ...formValue, id: this.data.id };
      this.customerService.updateCustomer(this.data.id, command).subscribe({
        next: () => {
          this.snackBar.open('Customer updated', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open('Error updating customer', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      const command: AddCustomerCommand = formValue;
      this.customerService.addCustomer(command).subscribe({
        next: () => {
          this.snackBar.open('Customer created', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving = false;
          this.snackBar.open('Error creating customer', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }
}
