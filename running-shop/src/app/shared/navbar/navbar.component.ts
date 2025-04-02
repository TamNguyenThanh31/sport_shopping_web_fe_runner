import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {AuthService} from '../../core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  currentUser: any;
  cartItems: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenu();
    });
  }

  updateMenu() {
    this.items = [
      {label: 'Shop', icon: 'pi pi-shopping-bag', routerLink: ['/products']},
      {label: 'Running Gear', icon: 'pi pi-bolt', routerLink: ['/gear']},
      {label: 'Training', icon: 'pi pi-heart', routerLink: ['/training']},
      {label: 'Community', icon: 'pi pi-users', routerLink: ['/community']}
    ];

    this.userMenuItems = this.currentUser
      ? [
        {label: 'My Profile', icon: 'pi pi-user', routerLink: ['/profile']},
        {label: 'Orders', icon: 'pi pi-box', routerLink: ['/orders']},
        {label: 'Wishlist', icon: 'pi pi-heart', routerLink: ['/wishlist']},
        {label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout()}
      ]
      : [
        {label: 'Login', icon: 'pi pi-sign-in', routerLink: ['/login']},
        {label: 'Register', icon: 'pi pi-user-plus', routerLink: ['/register']}
      ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  toggleSearch() {
    // Implement search functionality later
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    const names: string[] = this.currentUser.username.split(' ');
    return names.map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
}
