import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../../../shared/models/userDTO.model';

// Interface to represent the paginated response
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // ---------- CUSTOMER ----------
  /** Lấy danh sách tất cả khách hàng với phân trang */
  getCustomers(page: number = 0, size: number = 10): Observable<Page<UserDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<UserDTO>>(`${this.apiUrl}/customers`, { params });
  }

  /** Lấy thông tin khách hàng theo ID */
  getCustomerById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/customers/${id}`);
  }

  /** Tạo mới một khách hàng */
  createCustomer(user: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/customers`, user);
  }

  /** Cập nhật thông tin khách hàng theo ID */
  updateCustomer(id: number, user: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/customers/${id}`, user);
  }

  /** Xóa khách hàng theo ID */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

  // ---------- STAFF ----------
  /** Lấy danh sách tất cả nhân viên với phân trang */
  getStaff(page: number = 0, size: number = 10): Observable<Page<UserDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<UserDTO>>(`${this.apiUrl}/staff`, { params });
  }

  /** Lấy thông tin nhân viên theo ID */
  getStaffById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/staff/${id}`);
  }

  /** Tạo mới một nhân viên */
  createStaff(user: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/staff`, user);
  }

  /** Cập nhật thông tin nhân viên theo ID */
  updateStaff(id: number, user: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/staff/${id}`, user);
  }

  /** Xóa nhân viên theo ID */
  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/staff/${id}`);
  }
}
