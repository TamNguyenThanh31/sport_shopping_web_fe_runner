import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.handleRegistrationSuccess(),
      error: (err) => this.handleRegistrationError(err)
    });
  }

  private handleRegistrationSuccess(): void {
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    this.router.navigate(['/auth/login']);
  }

  private handleRegistrationError(error: any): void {
    const errorMessage = error.error?.message || 'Có lỗi xảy ra';
    alert(`Đăng ký thất bại: ${errorMessage}`);
  }

  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value;
    if (!password) return 0;

    let strength = 0;

    // Length contributes up to 40%
    strength += Math.min(password.length / 12 * 40, 40);

    // Character variety contributes up to 60%
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;
    strength += (varietyCount / 4) * 60;

    return Math.min(Math.round(strength), 100);
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();

    if (strength < 40) return '#ef4444'; // Red for weak
    if (strength < 70) return '#f59e0b'; // Yellow for medium
    return '#10b981'; // Green for strong
  }

  get password() {
    return this.registerForm.get('password');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }

  get agreeTerms() {
    return this.registerForm.get('agreeTerms');
  }
}
