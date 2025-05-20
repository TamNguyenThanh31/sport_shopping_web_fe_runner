import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartEventService {
  private cartChangedSource = new Subject<void>();
  cartChanged$ = this.cartChangedSource.asObservable();

  notifyCartChanged() {
    this.cartChangedSource.next();
  }
}