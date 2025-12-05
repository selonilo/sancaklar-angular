// src/app/features/worlds/worlds.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldsRoutingModule } from './worlds-routing.module';
import { WorldsComponent } from './worlds.component';
import { RegionSelectionComponent } from './components/region-selection/region-selection.component';

// İkonlar
import {
  LucideAngularModule,
  Castle, Globe, Zap, Loader2, LogOut, Users, CheckCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices, X, Snowflake, Sunrise, Sun, Trees
} from 'lucide-angular';

@NgModule({
  declarations: [
    WorldsComponent,
    RegionSelectionComponent
  ],
  imports: [
    CommonModule,
    WorldsRoutingModule,
    LucideAngularModule.pick({
      Castle, Globe, Zap, Loader2, LogOut, Users, CheckCircle,
      ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices, X, Snowflake, Sunrise, Sun, Trees
    })
  ]
})
export class WorldsModule { }
