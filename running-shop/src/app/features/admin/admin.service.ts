import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserDTO} from "../../shared/models/userDTO.model";


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/customers`);
  }

  getCustomerById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/customers/${id}`);
  }

  createCustomer(UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/customers`, UserDTO);
  }

  updateCustomer(id: number, UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/customers/${id}`, UserDTO);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

  getStaff(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/staff`);
  }

  getStaffById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/staff/${id}`);
  }

  createStaff(UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/staff`, UserDTO);
  }

  updateStaff(id: number, UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/staff/${id}`, UserDTO);
  }

  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/staff/${id}`);
  }
}
