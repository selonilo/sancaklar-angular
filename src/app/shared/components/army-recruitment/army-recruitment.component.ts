import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import * as Models from '../../../core/models/api.models';

interface UnitConfig {
    key: string;
    name: string;
    building: 'barracks' | 'stable' | 'workshop';
    wood: number;
    clay: number;
    iron: number;
    pop: number; // Nüfus
    time: number; // Saniye cinsinden baz süre
    icon: string;
}

const UNIT_DATA: UnitConfig[] = [
    // --- KIŞLA ---
    { key: 'SPEARMAN', name: 'Mızrakçı', building: 'barracks', wood: 50, clay: 30, iron: 10, pop: 1, time: 90, icon: 'sword' },
    { key: 'SWORDSMAN', name: 'Kılıç Ustası', building: 'barracks', wood: 30, clay: 30, iron: 70, pop: 1, time: 120, icon: 'shield' },
    { key: 'AXEMAN', name: 'Baltacı', building: 'barracks', wood: 60, clay: 30, iron: 40, pop: 1, time: 130, icon: 'axe' },
    { key: 'ARCHER', name: 'Okçu', building: 'barracks', wood: 100, clay: 30, iron: 60, pop: 1, time: 140, icon: 'crosshair' },

    // --- AHIR ---
    { key: 'SCOUT', name: 'Casus', building: 'stable', wood: 50, clay: 50, iron: 20, pop: 2, time: 90, icon: 'eye' },
    { key: 'LIGHT_CAVALRY', name: 'Hafif Atlı', building: 'stable', wood: 125, clay: 100, iron: 250, pop: 4, time: 180, icon: 'zap' },
    { key: 'HEAVY_CAVALRY', name: 'Ağır Atlı', building: 'stable', wood: 200, clay: 150, iron: 600, pop: 6, time: 300, icon: 'shield-check' },

    // --- ATÖLYE ---
    { key: 'RAM', name: 'Şahmerdan', building: 'workshop', wood: 300, clay: 200, iron: 200, pop: 5, time: 400, icon: 'hammer' },
    { key: 'CATAPULT', name: 'Mancınık', building: 'workshop', wood: 320, clay: 400, iron: 100, pop: 8, time: 600, icon: 'skull' }
];

@Component({
    selector: 'app-army-recruitment',
    templateUrl: './army-recruitment.component.html'
})
export class ArmyRecruitmentComponent implements OnChanges {
    @Input() villageId!: number;
    @Input() resources: any; // { wood, clay, iron, pop, maxPop }
    @Input() techLevels: any = {}; // { SPEARMAN: 1, ... }

    // Kuyrukları parent'tan alıyoruz
    @Input() barracksQueue: Models.UnitRecruitmentModel[] = [];
    @Input() stableQueue: Models.UnitRecruitmentModel[] = [];
    @Input() workshopQueue: Models.UnitRecruitmentModel[] = [];

    activeTab: 'barracks' | 'stable' | 'workshop' = 'barracks';

    // Kullanıcının input alanlarına girdiği sayılar: { SPEARMAN: 50, AXEMAN: 0 }
    recruitInputs: { [key: string]: number } = {};
    loading: { [key: string]: boolean } = {};

    constructor(private apiService: ApiService) {}

    ngOnChanges(changes: SimpleChanges): void {
        // Değişiklik olduğunda gerekirse resetleme yapılabilir
    }

    // Seçili sekmeye göre birimleri getir
    get activeUnits(): UnitConfig[] {
        return UNIT_DATA.filter(u => u.building === this.activeTab);
    }

    // Seçili sekmeye göre kuyruğu getir
    get activeQueue(): Models.UnitRecruitmentModel[] {
        switch (this.activeTab) {
            case 'barracks': return this.barracksQueue;
            case 'stable': return this.stableQueue;
            case 'workshop': return this.workshopQueue;
            default: return [];
        }
    }

    // Birim araştırılmış mı? (TechLevel > 0)
    isUnlocked(unitKey: string): boolean {
        return (this.techLevels[unitKey.toLowerCase()] || 0) > 0;
    }

    // Maksimum üretilebilecek sayıyı hesapla ve inputa yaz
    setMax(unit: UnitConfig): void {
        if (!this.resources) return;

        const maxWood = Math.floor(this.resources.wood / unit.wood);
        const maxClay = Math.floor(this.resources.clay / unit.clay);
        const maxIron = Math.floor(this.resources.iron / unit.iron);

        // Nüfus hesabı (Boş yer / Birim nüfusu)
        const freePop = Math.max(0, this.resources.maxPop - this.resources.pop);
        const maxPop = Math.floor(freePop / unit.pop);

        // En düşük olan sınır belirler
        const maxRecruitable = Math.min(maxWood, maxClay, maxIron, maxPop);

        this.recruitInputs[unit.key] = maxRecruitable;
    }

    recruit(unitKey: any): void {
        const amount = this.recruitInputs[unitKey];
        if (!amount || amount <= 0) return;

        this.loading[unitKey] = true;

        const request: Models.RecruitRequest = {
            villageId: this.villageId,
            unitType: unitKey,
            amount: amount
        };

        this.apiService.recruitUnits(request).subscribe({
            next: (newJob) => {
                // Başarılı olduğunda ilgili kuyruğa ekle
                // (Normalde parent'ı güncellemek en doğrusudur ama hızlı UI update için buraya pushluyoruz)
                if (this.activeTab === 'barracks') this.barracksQueue.push(newJob);
                else if (this.activeTab === 'stable') this.stableQueue.push(newJob);
                else if (this.activeTab === 'workshop') this.workshopQueue.push(newJob);

                // Inputu temizle ve loading kapa
                this.recruitInputs[unitKey] = 0;
                this.loading[unitKey] = false;

                // Kaynakları azaltmak için parent'a event emit edilebilir
            },
            error: (err) => {
                console.error("Üretim hatası", err);
                this.loading[unitKey] = false;
            }
        });
    }

    // Yardımcı: Kuyruktaki birim ikonunu bulmak için
    getIcon(unitType: string): string {
        const unit = UNIT_DATA.find(u => u.key === unitType);
        return unit ? unit.icon : 'users'; // default
    }
}
