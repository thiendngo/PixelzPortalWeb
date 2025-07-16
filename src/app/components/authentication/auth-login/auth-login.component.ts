import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../services/auth';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent {
  loginForm: FormGroup;
  SignInOptions = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {

    if (this.authService.isAuthenticated())
      this.router.navigate(['']);

    this.loginForm = this.fb.group({
      email: ['user1@example.com', [Validators.required, Validators.email]],
      password: ['User@123', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        // ✅ Navigate to dashboard on success
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Login failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
