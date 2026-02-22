import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContactDto, AddContactCommand, UpdateContactCommand } from '../../../api/models';
import { ContactService } from '../../../api/contact.service';
import { CustomerService } from '../../../api/customer.service';
import { CustomerDto } from '../../../api/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-contact-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule
    ],
    templateUrl: './contact-dialog.component.html',
    styles: [`
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 16px;
      min-width: 400px;
    }
  `]
})
export class ContactDialogComponent implements OnInit {
    form: FormGroup;
    isSaving = false;
    isEditMode = false;
    customers: CustomerDto[] = [];

    constructor(
        private fb: FormBuilder,
        private contactService: ContactService,
        private customerService: CustomerService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ContactDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isEditMode = !!(data && data.id);
        this.form = this.fb.group({
            firstName: [data?.firstName || '', Validators.required],
            lastName: [data?.lastName || '', Validators.required],
            email: [data?.email || '', [Validators.email]],
            phoneNo: [data?.phoneNo || ''],
            customerId: [data?.customerId || null]
        });
    }

    ngOnInit() {
        this.loadCustomers();
    }

    loadCustomers() {
        // Basic loading of customers for the dropdown. 
        // In a real app we might want pagination or search here as well.
        this.customerService.getCustomers(1, 100, '').subscribe({
            next: (result) => {
                this.customers = result.items || [];
            },
            error: (err) => {
                console.error('Failed to load customers', err);
            }
        });
    }

    save() {
        if (this.form.invalid) return;

        this.isSaving = true;
        if (this.isEditMode) {
            const command: UpdateContactCommand = {
                id: this.data.id,
                ...this.form.value
            };
            this.contactService.updateContact(this.data.id, command).subscribe({
                next: () => {
                    this.snackBar.open('Contact updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update contact', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        } else {
            const command: AddContactCommand = {
                ...this.form.value
            };
            this.contactService.addContact(command).subscribe({
                next: () => {
                    this.snackBar.open('Contact created successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to create contact', 'Close', { duration: 3000 });
                    console.error(err);
                }
            });
        }
    }
}
