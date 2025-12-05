import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ApiService} from '../../core/services/api.service';
import {UserModel} from '../../core/models/api.models'; // <--- Yeni Modeli ekledik

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Lütfen tüm alanları doğru şekilde doldurun.';

      // 3. KRİTİK NOKTA: Formun tüm alanlarını "dokunulmuş" olarak işaretle.
      // Bu, validasyon hatalarının UI'da anında görünmesini sağlar.
      this.registerForm.markAllAsTouched();
      return;
    }

    const {username, email, password, confirmPassword} = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor.';
      return;
    }

    this.isLoading = true;

    const registerRequest: UserModel = {
      username: username,
      email: email,
      password: password
    };

    this.apiService.register(registerRequest).subscribe({
      next: (response) => {
        this.router.navigate(['/worlds']);
      },
      error: (errorObj) => {
        this.errorMessage = errorObj?.error?.message || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
