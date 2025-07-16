import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppUser {
  id: string;
  email: string;
  // add other fields if needed
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://localhost:5001/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }
}
