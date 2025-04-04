import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  messages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const user = response.user;
          // Điều hướng dựa trên vai trò
          switch (user.role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'CUSTOMER':
              this.router.navigate(['/customer']);
              break;
            case 'STAFF':
              this.router.navigate(['/staff']);
              break;
            default:
              this.router.navigate(['/']);
          }
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Tài khoản hoặc mật khẩu không đúng.';
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi đăng nhập',
            detail: errorMessage,
            life: 3000
          });
        }
      })
    }
  }
}
