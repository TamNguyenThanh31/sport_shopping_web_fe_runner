import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Address} from "../../../../../shared/models/address.model";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {CheckboxModule} from "primeng/checkbox";
import {Button} from "primeng/button";

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    NgIf,
    CheckboxModule,
    Button
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent {
  @Input() display: boolean = false;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() address: Address | null = null;
  @Output() displayChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Address>();
  @Output() cancel = new EventEmitter<void>();

  addressForm: FormGroup;
  isViewMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      isDefault: [false]
    });
  }

  ngOnChanges(): void {
    this.isViewMode = this.mode === 'view';
    if (this.address) {
      this.addressForm.patchValue(this.address);
      this.isViewMode ? this.addressForm.disable() : this.addressForm.enable();
    } else {
      this.addressForm.reset();
      this.addressForm.enable();
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      const address: Address = this.addressForm.value;
      if (this.mode === 'edit' && this.address?.id) {
        address.id = this.address.id;
      }
      this.save.emit(address);
    } else {
      Object.keys(this.addressForm.controls).forEach(key => {
        const control = this.addressForm.get(key);
        console.log(`${key} invalid:`, control?.invalid, 'Errors:', control?.errors);
      });
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill out all required fields correctly' });
    }
  }

  closeDialog(): void {
    this.display = false;
    this.displayChange.emit(this.display);
    this.cancel.emit();
    this.addressForm.reset();
    this.cdr.detectChanges();
  }
}
