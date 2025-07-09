import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {Observable} from "rxjs";
import {AuthService} from "../../core/services/auth.service";
import { StravaService } from '../../features/customer/services/strava.service';
import { StravaStatus } from '../models/strava-status.model';
import { CustomerService } from '../../features/customer/services/customer.service';
import { UserDTO } from '../models/userDTO.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent implements OnInit {

  currentUser$: Observable<User | null>;
  stravaStatus?: StravaStatus;
  loadingStrava = false;
  stravaConnected = false;
  showChangePasswordDialog = false;
  changePasswordForm!: FormGroup;
  loadingPasswordChange = false;

  // Monthly goal (có thể hardcode hoặc lấy từ user setting)
  monthlyGoal = 100; // km

  constructor(
    public authService: AuthService,
    private stravaService: StravaService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
    this.initChangePasswordForm();
  }

  ngOnInit(): void {
    this.loadStravaData();
  }

  initChangePasswordForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  openChangePasswordDialog(): void {
    this.showChangePasswordDialog = true;
    this.changePasswordForm.reset();
  }

  closeChangePasswordDialog(): void {
    this.showChangePasswordDialog = false;
    this.changePasswordForm.reset();
  }

  onSubmitChangePassword(): void {
    if (this.changePasswordForm.valid) {
      this.loadingPasswordChange = true;
      
      this.currentUser$.subscribe(currentUser => {
        if (currentUser) {
          const userDTO: UserDTO = {
            ...currentUser,
            password: this.changePasswordForm.get('newPassword')?.value
          };

          this.customerService.updateProfile(userDTO).subscribe({
            next: (response: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Mật khẩu đã được thay đổi thành công!'
              });
              this.closeChangePasswordDialog();
              this.loadingPasswordChange = false;
            },
            error: (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: error.error?.message || 'Không thể thay đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại và thử lại!'
              });
              this.loadingPasswordChange = false;
            }
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      const control = this.changePasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  getPasswordStrength(password: string): { strength: string; color: string; percentage: number } {
    if (!password) return { strength: '', color: '', percentage: 0 };
    
    let score = 0;
    
    // Length check
    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    
    // Character type checks
    if (this.hasLowerCase) score += 20;
    if (this.hasUpperCase) score += 20;
    if (this.hasNumber) score += 10;
    if (this.hasSpecialChar) score += 10;

    // Return strength level
    if (score >= 80) return { strength: 'Mạnh', color: '#28a745', percentage: score };
    if (score >= 60) return { strength: 'Trung bình', color: '#ffc107', percentage: score };
    if (score >= 40) return { strength: 'Yếu', color: '#dc3545', percentage: score };
    return { strength: 'Rất yếu', color: '#dc3545', percentage: score };
  }

  // Lấy dữ liệu chạy bộ trong 30 ngày
  loadStravaData(): void {
    this.loadingStrava = true;
    this.stravaService.getStatus(30).subscribe({
      next: (status) => {
        this.stravaStatus = status;
        this.stravaConnected = true;
        this.loadingStrava = false;
      },
      error: (err) => {
        this.stravaConnected = false;
        this.loadingStrava = false;
        console.log('Strava not connected or error:', err);
      }
    });
  }

  connectStrava(): void {
    this.stravaService.connectStrava();
  }

  get monthlyProgress(): number {
    if (!this.stravaStatus) return 0;
    return Math.min((this.stravaStatus.totalDistanceKm / this.monthlyGoal) * 100, 100);
  }

  get runnerLevel(): { level: number; title: string; color: string } {
    if (!this.stravaStatus) {
      return { level: 0, title: 'Not Connected', color: '#6c757d' };
    }

    const distance = this.stravaStatus.totalDistanceKm;
    
    if (distance >= 501) return { level: 6, title: 'Master', color: '#ff6b35' };
    if (distance >= 351) return { level: 5, title: 'Elite', color: '#f7931e' };
    if (distance >= 201) return { level: 4, title: 'Advanced', color: '#ffd700' };
    if (distance >= 101) return { level: 3, title: 'Intermediate', color: '#28a745' };
    if (distance >= 51) return { level: 2, title: 'Novice', color: '#17a2b8' };
    if (distance >= 0) return { level: 1, title: 'Beginner', color: '#6c757d' };
    
    return { level: 0, title: 'Not Connected', color: '#6c757d' };
  }

  get weeklyGoal(): number {
    return this.monthlyGoal / 4; // Chia 4 tuần
  }

  get currentWeekProgress(): number {
    if (!this.stravaStatus) return 0;
    return Math.min((this.stravaStatus.totalDistanceKm / 4) / this.weeklyGoal * 100, 100);
  }

  // Password validation getters
  get hasMinLength(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password && password.length >= 6;
  }

  get hasLowerCase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password && /[a-z]/.test(password);
  }

  get hasUpperCase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password && /[A-Z]/.test(password);
  }

  get hasNumber(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password && /[0-9]/.test(password);
  }

  get hasSpecialChar(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value;
    return password && /[@$!%*?&]/.test(password);
  }

  // Helper methods for form validation
  get isNewPasswordInvalid(): boolean {
    const control = this.changePasswordForm.get('newPassword');
    return control ? control.invalid && control.touched : false;
  }

  hasNewPasswordError(errorType: string): boolean {
    const control = this.changePasswordForm.get('newPassword');
    return control ? !!control.errors?.[errorType] : false;
  }

  get isCurrentPasswordInvalid(): boolean {
    const control = this.changePasswordForm.get('currentPassword');
    return control ? control.invalid && control.touched : false;
  }

  hasCurrentPasswordError(errorType: string): boolean {
    const control = this.changePasswordForm.get('currentPassword');
    return control ? !!control.errors?.[errorType] : false;
  }

  get isConfirmPasswordInvalid(): boolean {
    const control = this.changePasswordForm.get('confirmPassword');
    return control ? control.invalid && control.touched : false;
  }

  hasConfirmPasswordError(errorType: string): boolean {
    const control = this.changePasswordForm.get('confirmPassword');
    return control ? !!control.errors?.[errorType] : false;
  }

  get hasPasswordMismatchError(): boolean {
    const confirmControl = this.changePasswordForm.get('confirmPassword');
    return this.changePasswordForm.errors?.['passwordMismatch'] && confirmControl?.touched;
  }

  get newPasswordValue(): string {
    return this.changePasswordForm.get('newPassword')?.value || '';
  }

  get passwordStrength(): { strength: string; color: string; percentage: number } {
    return this.getPasswordStrength(this.newPasswordValue);
  }
}
