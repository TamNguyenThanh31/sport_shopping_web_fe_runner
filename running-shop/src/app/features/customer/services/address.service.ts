import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Address } from '../../../shared/models/address.model';
import {AuthService} from "../../../core/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/addresses';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAddresses(userId?: number): Observable<Address[]> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<Address[]>(`${this.apiUrl}?userId=${currentUserId}`).pipe(catchError(this.handleError));
  }

  getAddressById(id: number, userId?: number): Observable<Address> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get<Address>(`${this.apiUrl}/${id}?userId=${currentUserId}`).pipe(catchError(this.handleError));
  }

  createAddress(address: Address, userId?: number): Observable<Address> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post<Address>(`${this.apiUrl}?userId=${currentUserId}`, address).pipe(catchError(this.handleError));
  }

  updateAddress(id: number, address: Address, userId?: number): Observable<Address> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.put<Address>(`${this.apiUrl}/${id}?userId=${currentUserId}`, address).pipe(catchError(this.handleError));
  }

  deleteAddress(id: number, userId?: number): Observable<void> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}?userId=${currentUserId}`).pipe(catchError(this.handleError));
  }

  setDefaultAddress(addressId: number, userId?: number): Observable<Address> {
    const currentUserId = userId || this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.patch<Address>(
      `${this.apiUrl}/${addressId}/set-default?userId=${currentUserId}`,
      null
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 400 && error.error.error) {
      errorMessage = error.error.error; // IllegalStateException
    } else if (error.status === 400 && error.error) {
      errorMessage = Object.values(error.error).join('; '); // Validation errors
    } else if (error.status === 404) {
      errorMessage = error.error.error || 'Address not found';
    }
    return throwError(() => new Error(errorMessage));
  }
}
