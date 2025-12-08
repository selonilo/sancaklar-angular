import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BuildingCardComponent} from './components/building-card/building-card.component';

// İkonlar
import {
    LucideAngularModule,
    Castle, User, Mail, Lock, Loader2, Sword, Shield,
    Hammer, FlaskConical, Map, LogOut, Home, X, CheckCircle, Zap, Globe, Users,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices, Swords,
    TreeDeciduous, Beef, Pickaxe, Wheat, Clock,
    Anvil, GraduationCap, Pencil, Eye, Crosshair, Axe,
    Magnet, MapPin, Star, Save, Crown, Target, Feather,
    Coins, Warehouse, Mountain, Trash2, Hourglass, Timer
} from 'lucide-angular';
import {ConstructionQueueComponent} from "./components/construction-queue/construction-queue.component";
import { WorldMapComponent } from './components/world-map/world-map.component';

@NgModule({
    declarations: [
        BuildingCardComponent,
        ConstructionQueueComponent,
        WorldMapComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        LucideAngularModule.pick({
            Castle, User, Mail, Lock, Loader2, Sword, Shield,
            Hammer, FlaskConical, Map, LogOut, Home, Crown, Eye, Axe,
            TreeDeciduous, Beef, Pickaxe, Wheat, Clock, Target, Crosshair,
            ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices,
            X, CheckCircle, Zap, Globe, Users, Swords, Feather,
            Anvil, GraduationCap, Trash2,
            Magnet, Mountain, Hourglass,
            Coins, Warehouse, MapPin, Star, Save, Timer, Pencil
        })
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        LucideAngularModule,
        BuildingCardComponent,
        ConstructionQueueComponent,
        WorldMapComponent
    ]
})
export class SharedModule {
}
