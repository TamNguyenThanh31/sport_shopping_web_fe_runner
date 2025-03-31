import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
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
          this.errorMessage = err.error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        }
      });
    }
  }

}
