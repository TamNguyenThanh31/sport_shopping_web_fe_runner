import {Component, OnInit} from '@angular/core';
import {SidebarService} from "./shared/sidebar.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'running-shop';

  isSidebarCollapsed: boolean = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isSidebarCollapsed = isCollapsed;
      console.log('Sidebar collapsed:', isCollapsed);
    });
  }

}
