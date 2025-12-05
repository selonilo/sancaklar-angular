import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

// İkonlar (React kodundaki ikonların aynısı)
import { LucideAngularModule, Castle, Shield, Swords, Loader2, User, Lock, AlertCircle, ArrowLeft, KeyRound, X, Mail } from 'lucide-angular';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Castle, Shield, Swords, Loader2, User, Lock, AlertCircle, ArrowLeft, KeyRound, X, Mail })
  ]
})
export class LoginModule { }
