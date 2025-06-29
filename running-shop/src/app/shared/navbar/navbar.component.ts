import {Component, OnInit, HostListener, ViewEncapsulation} from '@angular/core';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {AuthService} from '../../core/services/auth.service';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';
import {Menubar, MenubarModule} from "primeng/menubar";
import {ButtonDirective} from "primeng/button";
import {NgIf, NgStyle} from "@angular/common";
import {Avatar, AvatarModule} from "primeng/avatar";
import {Menu, MenuModule} from "primeng/menu";
import {CartService} from "../../features/customer/services/cart.servcie";
import {Sidebar, SidebarModule} from "primeng/sidebar";
import {CartSidebarComponent} from "../../features/customer/components/cart-sidebar/cart-sidebar.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    MenubarModule,
    PrimeTemplate,
    ButtonDirective,
    RouterLink,
    NgIf,
    AvatarModule,
    NgStyle,
    MenuModule,
    SidebarModule,
    RouterOutlet,
    CartSidebarComponent
  ]
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  currentUser: any;
  cartItems = 0;
  showSidebar = false;
  isScrolled = false;

  // private cartSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
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
        label: 'Lịch sử mua hàng',
        icon: 'pi pi-bolt',
        routerLink: ['/orders'],
        styleClass: 'menu-item'
      },
      {
        label: 'Strava',
        icon: 'pi pi-map',
        routerLink: ['/strava'],
        styleClass: 'menu-item'
      },
      {
        label: 'Hỗ trợ',
        icon: 'pi pi-users',
        routerLink: ['/chat'],
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
          label: 'Address',
          icon: 'pi pi-map-marker',
          routerLink: ['/addresses'],
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

  loadCartItemCount(): void {
    this.cartService.getCartItemCount(this.currentUser ? 1 : 0).subscribe({
      next: (count) => (this.cartItems = count),
      error: (err) => console.error('Lỗi khi lấy số lượng giỏ hàng:', err)
    });
  }

  toggleCartSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  // ngOnDestroy() {
  //   if (this.cartSubscription) {
  //     this.cartSubscription.unsubscribe();
  //   }
  // }
}
