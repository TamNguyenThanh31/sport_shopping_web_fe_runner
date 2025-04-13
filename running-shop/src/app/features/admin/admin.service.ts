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

// ---------- CUSTOMER ----------
  /** Lấy danh sách tất cả khách hàng */
  getCustomers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/customers`);
  }

  /** Lấy thông tin khách hàng theo ID */
  getCustomerById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/customers/${id}`);
  }

  /** Tạo mới một khách hàng */
  createCustomer(UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/customers`, UserDTO);
  }

  /** Cập nhật thông tin khách hàng theo ID */
  updateCustomer(id: number, UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/customers/${id}`, UserDTO);
  }

  /** Xóa khách hàng theo ID */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

// ---------- STAFF ----------
  /** Lấy danh sách tất cả nhân viên */
  getStaff(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/staff`);
  }

  /** Lấy thông tin nhân viên theo ID */
  getStaffById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/staff/${id}`);
  }

  /** Tạo mới một nhân viên */
  createStaff(UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/staff`, UserDTO);
  }

  /** Cập nhật thông tin nhân viên theo ID */
  updateStaff(id: number, UserDTO: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/staff/${id}`, UserDTO);
  }

  /** Xóa nhân viên theo ID */
  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/staff/${id}`);
  }

}
