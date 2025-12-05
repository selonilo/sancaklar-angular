import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

// İkonlar
import { LucideAngularModule, Swords, Castle, Crown, Users, ChevronRight, Flame } from 'lucide-angular';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    // Kullanılacak ikonları import ediyoruz
    LucideAngularModule.pick({
      Swords,
      Castle,
      Crown,
      Users,
      ChevronRight,
      Flame
    })
  ]
})
export class HomeModule { }
