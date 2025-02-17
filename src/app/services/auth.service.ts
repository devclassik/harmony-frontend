import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private userRole: string | null = null;

  constructor(private router: Router) {
    this.loadAuthState();
  }

  login(username: string, password: string) {
    if (username === 'admin' && password === 'qaz') {
      this.isAuthenticated = true;
      this.userRole = 'Admin';
      this.saveAuthState();
      return { auth: this.isAuthenticated, role: this.userRole };
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userRole = null;
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  private saveAuthState(): void {
    localStorage.setItem('isAuthenticated', JSON.stringify(this.isAuthenticated));
    localStorage.setItem('userRole', this.userRole!);
  }

  private loadAuthState(): void {
    const authState = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = authState ? JSON.parse(authState) : false;
    this.userRole = localStorage.getItem('userRole');
  }

  private clearAuthState(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  }
}
