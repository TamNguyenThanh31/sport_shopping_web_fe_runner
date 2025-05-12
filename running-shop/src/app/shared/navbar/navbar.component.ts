import {Component, OnInit, HostListener, ViewEncapsulation} from '@angular/core';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {AuthService} from '../../core/services/auth.service';
import {Router, RouterLink} from '@angular/router';
// import { CartService } from '../../core/services/cart.service';
import {Subscription} from 'rxjs';
import {Menubar} from "primeng/menubar";
import {ButtonDirective} from "primeng/button";
import {NgIf, NgStyle} from "@angular/common";
import {Avatar} from "primeng/avatar";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    Menubar,
    PrimeTemplate,
    ButtonDirective,
    RouterLink,
    NgIf,
    Avatar,
    NgStyle,
    Menu
  ]
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  currentUser: any;
  cartItems: number = 0;
  isScrolled = false;

  // private cartSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    // private cartService: CartService
  ) {
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenu();
    });

    // this.cartSubscription = this.cartService.cart$.subscribe(cart => {
    //   this.cartItems = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    // });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  updateMenu() {
    this.items = [
      {
        label: 'Shop',
        icon: 'pi pi-shopping-bag',
        routerLink: ['/products'],
        styleClass: 'menu-item'
      },
      {
        label: 'Running Gear',
        icon: 'pi pi-bolt',
        routerLink: ['/gear'],
        styleClass: 'menu-item'
      },
      {
        label: 'Training Plans',
        icon: 'pi pi-map',
        routerLink: ['/training'],
        styleClass: 'menu-item'
      },
      {
        label: 'Community',
        icon: 'pi pi-users',
        routerLink: ['/community'],
        styleClass: 'menu-item'
      }
    ];

    this.userMenuItems = this.currentUser
      ? [
        {
          label: 'My Profile',
          icon: 'pi pi-user',
          routerLink: ['/profile'],
          styleClass: 'user-menu-item'
        },
        {
          label: 'My Orders',
          icon: 'pi pi-box',
          routerLink: ['/orders'],
          styleClass: 'user-menu-item'
        },
        {
          label: 'Wishlist',
          icon: 'pi pi-heart',
          routerLink: ['/wishlist'],
          styleClass: 'user-menu-item'
        },
        {separator: true},
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: () => this.logout(),
          styleClass: 'user-menu-item'
        }
      ]
      : [
        {
          label: 'Login',
          icon: 'pi pi-sign-in',
          routerLink: ['/auth/login'],
          styleClass: 'user-menu-item'
        },
        {
          label: 'Register',
          icon: 'pi pi-user-plus',
          routerLink: ['/auth/register'],
          styleClass: 'user-menu-item'
        }
      ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  toggleSearch() {
    // Implement search functionality
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    const names: string[] = this.currentUser.username.split(' ');
    return names.map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  // ngOnDestroy() {
  //   if (this.cartSubscription) {
  //     this.cartSubscription.unsubscribe();
  //   }
  // }
}
