import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../../../core/services/auth.service";

@Component({
    selector: 'app-staff-dashboard',
    templateUrl: './staff-dashboard.component.html',
    styleUrls: ['./staff-dashboard.component.scss'],
    standalone: false
})
export class StaffDashboardComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

}
