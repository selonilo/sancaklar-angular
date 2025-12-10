import {Component, Input, OnInit, OnDestroy, SimpleChanges, OnChanges, Output, EventEmitter} from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ResearchQueueModel, ResearchRequest } from '../../../core/models/api.models';

// Teknoloji Tanımları (Statik Bilgi)
interface TechDefinition {
    key: string;      // Enum ile aynı (SPEARMAN, SWORDSMAN vs.)
    name: string;
    description: string;
    icon: string;     // Lucide icon name
}

// Bina Gereksinimleri (Mapping)
const UNIT_REQUIREMENTS: { [key: string]: { building: string, name: string } } = {
    'SPEARMAN': { building: 'barracks', name: 'Kışla' },
    'SWORDSMAN': { building: 'barracks', name: 'Kışla' },
    'AXEMAN': { building: 'barracks', name: 'Kışla' },
    'ARCHER': { building: 'barracks', name: 'Kışla' },
    'SCOUT': { building: 'stable', name: 'Ahır' },
    'LIGHT_CAVALRY': { building: 'stable', name: 'Ahır' },
    'HEAVY_CAVALRY': { building: 'stable', name: 'Ahır' },
    'RAM': { building: 'workshop', name: 'Atölye' },
    'CATAPULT': { building: 'workshop', name: 'Atölye' },
    'CONQUEROR': { building: 'academy', name: 'Akademi' }
};

const TECH_CONFIG: TechDefinition[] = [
    { key: 'SPEARMAN', name: 'Mızrakçı', description: 'Atlılara karşı etkili temel savunma.', icon: 'sword' }, // lucide 'swords' yoksa 'sword'
    { key: 'SWORDSMAN', name: 'Kılıç Ustası', description: 'Piyadelere karşı güçlü zırhlı birim.', icon: 'shield' },
    { key: 'AXEMAN', name: 'Baltacı', description: 'Yüksek saldırı gücüne sahip piyade.', icon: 'axe' },
    { key: 'ARCHER', name: 'Okçu', description: 'Dengeli savunma sağlayan menzilli birim.', icon: 'crosshair' },
    { key: 'SCOUT', name: 'Casus', description: 'Düşman köylerini gözetler.', icon: 'eye' },
    { key: 'LIGHT_CAVALRY', name: 'Hafif Atlı', description: 'Hızlı hareket eder, yağma için idealdir.', icon: 'zap' },
    { key: 'HEAVY_CAVALRY', name: 'Ağır Atlı', description: 'Zırhlı ve güçlü atlı birim.', icon: 'shield-check' },
    { key: 'RAM', name: 'Şahmerdan', description: 'Surları yıkar.', icon: 'hammer' },
    { key: 'CATAPULT', name: 'Mancınık', description: 'Binaları yıkar.', icon: 'skull' },
    { key: 'CONQUEROR', name: 'Misyoner', description: 'Köyleri fetheder.', icon: 'crown' }
];

@Component({
    selector: 'app-village-research',
    templateUrl: './village-research.component.html',
})
export class VillageResearchComponent implements OnInit, OnChanges {
    @Input() villageId!: number;
    @Input() buildings: any;
    @Input() researchInfo: any;
    @Output() researchStarted = new EventEmitter();

    queue: ResearchQueueModel[] = [];
    loading = false;
    techList = TECH_CONFIG;

    constructor(private gameService: ApiService) {}

    ngOnInit(): void {
        this.loadQueue();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Eğer parent component'ten veri değişirse tetiklenir
    }

    loadQueue(): void {
        this.gameService.getResearchQueue(this.villageId).subscribe(q => this.queue = q);
    }

    // --- MANTIK METOTLARI ---

    // 1. Bina şartı sağlanıyor mu?
    isBuildingMet(techKey: string): boolean {
        const req = UNIT_REQUIREMENTS[techKey];
        if (!req) return true; // Şart yoksa true
        // buildings objesinde ilgili bina 0'dan büyükse var demektir
        const buildingLevel = this.buildings ? this.buildings[req.building] : 0;
        return buildingLevel > 0;
    }

    // 2. Gereken binanın adını getir
    getRequiredBuildingName(techKey: string): string {
        return UNIT_REQUIREMENTS[techKey]?.name || '';
    }

    // 3. Maliyetleri ResearchInfo (Backend Model) içinden çek
    // Backend field isimleri (camelCase) ile Enum keyleri eşleşmeli
    getCostData(techKey: string) {
        if (!this.researchInfo) return { wood: 0, meat: 0, iron: 0, duration: 0 };

        // Enum: SPEARMAN -> Field: spearmanWood, spearmanDuration
        // Dönüşüm: TitleCase yapıp "Wood", "Meat" ekliyoruz.
        // Basit bir mapleme mantığı:
        const prefix = this.toCamelCase(techKey); // SPEARMAN -> spearman

        return {
            wood: this.researchInfo[prefix + 'Wood'] || 0,
            meat: this.researchInfo[prefix + 'Meat'] || 0, // Backend'de 'Meat' mi 'Clay' mi dikkat et
            iron: this.researchInfo[prefix + 'Iron'] || 0,
            duration: this.researchInfo[prefix + 'Duration'] || 0
        };
    }

    // Helper: CONQUEROR -> conqueror, LIGHT_CAVALRY -> lightCavalry
    private toCamelCase(str: string): string {
        return str.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    }

    getLevel(techKey: string): number {
        return this.researchInfo[techKey.toLowerCase()] || 0;
    }

    isInQueue(techKey: string): boolean {
        return this.queue.some(q => q.unitType === techKey);
    }

    startResearch(techKey: any): void {
        if (!this.isBuildingMet(techKey)) return;

        this.loading = true;
        const request: ResearchRequest = {
            villageId: this.villageId,
            unitType: techKey
        };

        this.gameService.startResearch(request).subscribe({
            next: (newItem) => {
                this.researchStarted.emit();
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    formatDuration(totalSeconds: number): string {
        if (!totalSeconds) return '0sn';

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        // Eğer 1 saatten uzun sürüyorsa (Örn: Fetihçi)
        if (h > 0) {
            return `${h}sa ${m}dk`; // Saat işin içine girince saniye detayına gerek kalmaz genelde
        }

        // Sadece saniye varsa (Örn: 45sn)
        if (m === 0) {
            return `${s}sn`;
        }

        // Dakika ve saniye (Örn: 12dk 30sn)
        return `${m}dk ${s}sn`;
    }

    isResearched(techKey: string): boolean {
        if (!this.researchInfo) return false;

        // TechKey: ARCHER -> propName: archer
        const propName = this.toCamelCase(techKey);

        // Eğer değer 1 (veya true) ise araştırılmış demektir
        return this.researchInfo[propName] === 1;
    }
}
