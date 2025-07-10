import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import {UserDTO} from "../../../shared/models/userDTO.model";
import {UpdatePassword} from "../../../shared/models/update-password.model";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {
  }

  updateProfile(user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/update-customer`, user);
  }

  changePassword(updatePassword: UpdatePassword): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, updatePassword, { 
      observe: 'response',
      responseType: 'text'
    });
  }
}
