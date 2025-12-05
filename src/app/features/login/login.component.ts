// src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'; // FormControl eklendi
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoginModel } from '../../core/models/api.models';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    // Mevcut Login Formu Değişkenleri
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    // --- Şifre Yenileme Modalı İçin Değişkenler ---
    isForgotPasswordOpen = false;
    isResetting = false;
    resetMessage: { type: 'success' | 'error', text: string } | null = null;

    // Şifre yenileme için ayrı bir kontrol (Tek input olduğu için FormGroup gerekmez)
    forgotPasswordControl = new FormControl('', [Validators.required, Validators.email]);

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    // --- Login İşlemi ---
    onSubmit() {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const { username, password } = this.loginForm.value;

        const loginRequest: LoginModel = {
            username: username,
            password: password
        };

        this.apiService.login(loginRequest).subscribe({
            next: (response) => {
                // Token serviste kaydedildi, yönlendiriyoruz
                this.router.navigate(['/worlds']);
            },
            error: (errorObj) => {
                this.errorMessage = errorObj?.error?.message || 'Giriş başarısız. Kullanıcı adı veya şifre hatalı.';
                this.isLoading = false;
            },
            complete: () => {
                this.isLoading = false; // Hata olsa da olmasa da loading kapat
            }
        });
    }

    // --- Şifremi Unuttum Modal İşlemleri ---

    openForgotPassword() {
        this.isForgotPasswordOpen = true;
        this.resetMessage = null;
        this.forgotPasswordControl.reset(); // Inputu temizle
    }

    closeForgotPassword() {
        this.isForgotPasswordOpen = false;
    }

    onRefreshPassword() {
        // Validasyon kontrolü
        if (this.forgotPasswordControl.invalid) {
            this.forgotPasswordControl.markAsTouched();
            return;
        }

        this.isResetting = true;
        this.resetMessage = null;

        const email = this.forgotPasswordControl.value as string;

        // Servis çağrısı
        this.apiService.refreshPassword({ mail: email }).subscribe({
            next: (response) => {
                this.isResetting = false;
                this.resetMessage = {
                    type: 'success',
                    text: response.message || 'Şifre sıfırlama bağlantısı e-posta adresine gönderildi.'
                };

                // İstersen başarılı olduktan 3 saniye sonra modalı kapatabilirsin:
                // setTimeout(() => this.closeForgotPassword(), 3000);
            },
            error: (err) => {
                this.isResetting = false;
                this.resetMessage = {
                    type: 'error',
                    text: err.error?.message || 'Bir hata oluştu. Lütfen e-posta adresini kontrol et.'
                };
            }
        });
    }
}
