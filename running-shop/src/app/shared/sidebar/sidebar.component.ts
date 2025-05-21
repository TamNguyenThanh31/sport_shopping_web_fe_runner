import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/services/auth.service";
import { SidebarService } from "../sidebar.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit {
  isAdmin: boolean = false;
  isCollapsed: boolean = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isCollapsed = isCollapsed;
      console.log('Sidebar isCollapsed:', isCollapsed); // Thêm log để debug
    });

    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
    });
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar(); // Chỉ gọi service, không tự cập nhật isCollapsed
  }
}
