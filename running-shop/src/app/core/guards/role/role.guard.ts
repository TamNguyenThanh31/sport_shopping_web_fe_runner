import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import {AuthService} from "../../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getRole();

    if (userRole && expectedRole.includes(userRole)) {
      return true;
    } else {
      alert('Bạn không có quyền truy cập trang này!');
      // Điều hướng về trang phù hợp với vai trò của user
      const currentUserRole = this.authService.getRole();
      switch (currentUserRole) {
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
          this.router.navigate(['/auth/login']);
      }
      return false;
    }
  }

}
