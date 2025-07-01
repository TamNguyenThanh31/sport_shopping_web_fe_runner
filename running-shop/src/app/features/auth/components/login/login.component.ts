import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  rememberMe = false;
  loginError = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRememberedCredentials();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  private loadRememberedCredentials(): void {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const { identifier, password } = JSON.parse(rememberedUser);
      this.loginForm.patchValue({
        identifier,
        password,
        rememberMe: true
      });
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onInputChange(): void {
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    if (this.loginError) {
      this.loginError = '';
    }
  }

  onRememberMeChange(): void {
    this.rememberMe = this.loginForm.get('rememberMe')?.value;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }

    this.loginError = '';
    this.isLoading = true;
    this.authenticateUser();
  }

  private markFormFieldsAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private authenticateUser(): void {
    const { identifier, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      this.storeCredentials(identifier, password);
    } else {
      this.clearStoredCredentials();
    }

    this.authService.login({ identifier, password }).subscribe({
      next: (response) => this.handleLoginSuccess(response),
      error: (err) => this.handleLoginError(err)
    });
  }

  private storeCredentials(identifier: string, password: string): void {
    localStorage.setItem('rememberedUser', JSON.stringify({ identifier, password }));
  }

  private clearStoredCredentials(): void {
    localStorage.removeItem('rememberedUser');
  }

  private handleLoginSuccess(response: any): void {
    this.isLoading = false;
    this.showSuccessMessage();
    this.navigateBasedOnRole(response.user.role);
  }

  private navigateBasedOnRole(role: string): void {
    const routes: { [key: string]: string } = {
      'ADMIN': '/admin/report',
      'CUSTOMER': '/customer',
      'STAFF': '/staff'
    };

    this.router.navigate([routes[role] || '/']);
  }

  private showSuccessMessage(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đăng nhập thành công!',
      life: 3000
    });
  }

  private handleLoginError(error: any): void {
    this.isLoading = false;
    let errorMessage = 'Đã xảy ra lỗi khi đăng nhập.';
    
    if (error?.status === 401) {
      errorMessage = 'Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.';
    } else if (error?.status === 404) {
      errorMessage = 'Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập hoặc số điện thoại.';
    } else if (error?.status === 403) {
      errorMessage = 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.';
    } else if (error?.status === 400) {
      errorMessage = 'Bạn đã nhập sai mật khẩu, hãy thử lại!';
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.loginError = errorMessage;
    this.showErrorMessage(errorMessage);
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi đăng nhập',
      detail: message,
      life: 3000
    });
  }

  // Form control getters for cleaner template
  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMeControl() {
    return this.loginForm.get('rememberMe');
  }
}
