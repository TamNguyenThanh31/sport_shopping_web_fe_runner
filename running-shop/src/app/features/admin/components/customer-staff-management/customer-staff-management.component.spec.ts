import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerStaffManagementComponent } from './customer-staff-management.component';

describe('CustomerStaffManagementComponent', () => {
  let component: CustomerStaffManagementComponent;
  let fixture: ComponentFixture<CustomerStaffManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerStaffManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerStaffManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
