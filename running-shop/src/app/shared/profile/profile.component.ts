import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {Observable} from "rxjs";
import {AuthService} from "../../core/services/auth.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent implements OnInit {

  currentUser$: Observable<User | null>;

  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {}

  activities = [
    {
      date: new Date('2023-05-15'),
      title: '10K Personal Best',
      description: 'Achieved new personal record on 10K run',
      icon: 'pi-trophy'
    },
    {
      date: new Date('2023-05-08'),
      title: 'Joined Marathon Challenge',
      description: 'Registered for upcoming city marathon',
      icon: 'pi-flag'
    },
    {
      date: new Date('2023-04-28'),
      title: 'New Running Shoes',
      description: 'Purchased latest model of running shoes',
      icon: 'pi-shopping-bag'
    },
    {
      date: new Date('2023-04-15'),
      title: 'Monthly Milestone',
      description: 'Completed 100km this month',
      icon: 'pi-star'
    }
  ];
}
