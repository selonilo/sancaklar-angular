// src/app/shared/components/building-card/building-card.component.ts
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {VillageModel} from "../../../core/models/api.models";
import {BUILDINGS_CONFIG} from "../../../features/game/game.constants";
import {ApiService} from "../../../core/services/api.service";

@Component({
    selector: 'app-building-card',
    templateUrl: './building-card.component.html',
    styleUrls: ['./building-card.component.scss']
})
export class BuildingCardComponent {
    @Input() type!: string;
    @Input() currentLevel: number = 0;
    @Input() village!: VillageModel;

    @Output() upgrade = new EventEmitter<string>();

    isUpdating = false;

    // ApiService'i constructor'a ekledik
    constructor(private apiService: ApiService) {}

    get buildingInfo() {
        return BUILDINGS_CONFIG[this.type] || {name: this.type, description: ''};
    }

    get cost() {
        const bData = this.village?.buildings as any || {};
        return {
            wood: bData[`${this.type}CostWood`] || 0,
            meat: bData[`${this.type}CostMeat`] || 0,
            iron: bData[`${this.type}CostIron`] || 0,
            time: bData[`${this.type}Duration`] || 0
        };
    }

    get canAfford(): boolean {
        if (!this.village) return false;
        return (
            this.village.resources.woodAmount >= this.cost.wood &&
            this.village.resources.meatAmount >= this.cost.meat &&
            this.village.resources.ironAmount >= this.cost.iron
        );
    }

    get canUpgrade(): boolean {
        const maxLevel = 30;
        return this.canAfford && this.targetLevel < maxLevel;
    }

    get nextLevel() {
        return this.currentLevel + 1;
    }

    // --- YENİ EKLENEN METOD ---
    updateVillageName() {
        if (!this.village.name || this.village.name.trim() === '') return;

        this.isUpdating = true;
        this.apiService.updateVillage(this.village).subscribe({
            next: () => {
                this.isUpdating = false;
                // İstersen burada bir toast mesajı gösterebilirsin
                console.log('Köy ismi güncellendi');
            },
            error: (err) => {
                this.isUpdating = false;
                console.error('Köy ismi güncellenemedi', err);
            }
        });
    }

    onUpgradeClick() {
        if (this.canUpgrade) {
            this.upgrade.emit(this.type);
        }
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}sa ${minutes}dk`;
        if (minutes > 0) return `${minutes}dk ${secs}sn`;
        return `${secs}sn`;
    }

    getIconName(): string {
        const icons: any = {
            headquarters: 'castle',
            barracks: 'swords',
            stable: 'magnet',
            workshop: 'hammer',
            academy: 'graduation-cap',
            smithy: 'anvil',
            market: 'coins',
            timberCamp: 'tree-deciduous',
            meatPlant: 'beef',
            ironMine: 'pickaxe',
            farm: 'wheat',
            warehouse: 'warehouse',
            wall: 'shield'
        };
        return icons[this.type] || 'home';
    }

    get targetLevel(): number {
        const bData = this.village?.buildings as any || {};
        const targetKey = `${this.type}TargetLevel`;
        return bData[targetKey] !== undefined ? bData[targetKey] : this.currentLevel;
    }

    get nextLevelDisplay() {
        return this.targetLevel;
    }
}
