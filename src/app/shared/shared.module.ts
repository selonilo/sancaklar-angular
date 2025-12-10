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
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices, Swords,BrickWall,
    TreeDeciduous, Beef, Pickaxe, Wheat, Clock, Info, TreePine, Skull,
    Anvil, GraduationCap, Pencil, Eye, Crosshair, Axe, ShieldCheck,
    Magnet, MapPin, Star, Save, Crown, Target, Feather, Drumstick,
    Coins, Warehouse, Mountain, Trash2, Hourglass, Timer, Check, Dog
} from 'lucide-angular';
import {ConstructionQueueComponent} from "./components/construction-queue/construction-queue.component";
import { WorldMapComponent } from './components/world-map/world-map.component';
import {VillageResearchComponent} from "./components/research/village-research.component";
import {VillageResearchQueueComponent} from "./components/research-queue/village-research-queue.component";
import {ArmyRecruitmentComponent} from "./components/army-recruitment/army-recruitment.component";

@NgModule({
    declarations: [
        BuildingCardComponent,
        ConstructionQueueComponent,
        WorldMapComponent,
        VillageResearchComponent,
        VillageResearchQueueComponent,
        ArmyRecruitmentComponent
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
            ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Dices, Skull,
            X, CheckCircle, Zap, Globe, Users, Swords, Feather,
            Anvil, GraduationCap, Trash2, TreePine,BrickWall,
            Magnet, Mountain, Hourglass, Info, ShieldCheck, Drumstick,
            Coins, Warehouse, MapPin, Star, Save, Timer, Pencil, Check, Dog
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
        WorldMapComponent,
        VillageResearchComponent,
        VillageResearchQueueComponent,
        ArmyRecruitmentComponent
    ]
})
export class SharedModule {
}
