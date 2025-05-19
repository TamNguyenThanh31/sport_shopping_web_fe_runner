import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [
    NgIf
  ],
  standalone: true,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent{

  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

}
