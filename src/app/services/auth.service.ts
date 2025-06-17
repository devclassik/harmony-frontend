import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/rbac.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private userRole: string | null = null;
  private currentUser: User | null = null;

  // Mock users for different roles
  private mockUsers = [
    {
      id: '1',
      name: 'John D.',
      fullName: 'John Doe',
      email: 'admin@example.com',
      role: 'admin',
      username: 'admin',
      password: 'qaz',
    },
    {
      id: '2',
      name: 'Jane S.',
      fullName: 'Jane Smith',
      email: 'manager@example.com',
      role: 'manager',
      username: 'manager',
      password: 'manager123',
    },
    {
      id: '3',
      name: 'Bob J.',
      fullName: 'Bob Johnson',
      email: 'user@example.com',
      role: 'user',
      username: 'user',
      password: 'user123',
    },
  ];

  constructor(private router: Router) {
    this.loadAuthState();
  }

  login(username: string, password: string) {
    // Find user by credentials
    const user = this.mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.isAuthenticated = true;
      this.userRole = user.role;
      this.currentUser = {
        id: user.id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      };
      this.saveAuthState();
      return {
        auth: this.isAuthenticated,
        role: this.userRole,
        user: this.currentUser,
      };
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userRole = null;
    this.currentUser = null;
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if current user has a specific role
  hasRole(role: string): boolean {
    return this.userRole === role;
  }

  // Check if current user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return this.userRole ? roles.includes(this.userRole) : false;
  }

  private saveAuthState(): void {
    localStorage.setItem(
      'isAuthenticated',
      JSON.stringify(this.isAuthenticated)
    );
    localStorage.setItem('userRole', this.userRole!);
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  private loadAuthState(): void {
    const authState = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = authState ? JSON.parse(authState) : false;
    this.userRole = localStorage.getItem('userRole');

    const userState = localStorage.getItem('currentUser');
    this.currentUser = userState ? JSON.parse(userState) : null;
  }

  private clearAuthState(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  }
}
