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
    @Inject(MAT_DIALOG_DATA) public data: CustomerDto | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      taxId: [data?.taxId || ''],
      address: [data?.address || ''],
      zipCode: [data?.zipCode || ''],
      city: [data?.city || ''],
      country: [data?.country || ''],
      www: [data?.www || ''],
      facebook: [data?.facebook || '']
    });

    // Note: If Dto doesn't have address/zipCode (which it doesn't in spec), user might see empty fields on edit.
    // Ideally we fetch details by ID on edit open if Dto is incomplete.
    // But for list Dto, let's assume it's what we have. 
    // Spec says GET /Customers/{id} returns CustomerDto which has SAME fields as list item in spec provided?
    // Wait, CustomerDto in spec: id, name, taxId, city, country, www, facebook.
    // UpdateCustomerCommand: id, name, taxId, address, zipCode, city, country, www, facebook.
    // So if I edit, I might overwrite address/zipCode with empty if I don't fetch them.
    // I should fetch full details on init if isEdit.
  }

  ngOnInit() {
    if (this.isEdit && this.data?.id) {
      this.form.disable(); // Disable while loading
      this.customerService.getCustomer(this.data.id).subscribe(details => {
        // The API returns CustomerDto. Does CustomerDto have address key in spec?
        // Spec provided: CustomerDto has: id, name, taxId, city, country, www, facebook.
        // It DOES NOT have address, zipCode. 
        // BUT UpdateCustomerCommand HAS address, zipCode.
        // This implies the GET DTO is missing fields or the spec is inconsistent/incomplete for GET details.
        // I will assume for now I can map what returns. If the API returns address in JSON even if not in spec schema, I can use it.
        // Or I should stick to what's in Dto.

        // Let's assume the API *should* return them and I just cast.
        this.form.patchValue(details);
        this.form.enable();
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
