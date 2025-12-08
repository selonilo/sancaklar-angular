// src/app/features/game/game.component.ts

import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ApiService} from '../../core/services/api.service';
import {
    VillageModel, ConstructionModel, ResearchQueueModel,
    UnitRecruitmentModel, MovementTrackerModel, VillageMapModel
} from '../../core/models/api.models';
import {BUILDINGS_CONFIG, TECH_CONFIG, UNIT_CONFIG} from './game.constants';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
    // --- Veri Modelleri ---
    village: VillageModel | null = null;
    constructions: ConstructionModel[] = [];
    researches: ResearchQueueModel[] = [];
    techLevels: any = {}; // Record<string, number>
    barracksQueue: UnitRecruitmentModel[] = [];
    stableQueue: UnitRecruitmentModel[] = [];
    workshopQueue: UnitRecruitmentModel[] = [];
    movements: MovementTrackerModel[] = [];

    // --- UI State ---
    isLoading = true;
    error = '';
    activeTab = 'overview'; // 'overview' | 'buildings' | 'research' | 'army' | 'map'

    // Modal State
    selectedBuildingInfo: any = null;

    // --- Loading States (Actions) ---
    upgradingBuilding: string | null = null;
    researchingTech: string | null = null;
    recruitingUnit: string | null = null;

    // --- Timer Referansı ---
    private constructionTimer: any;

    // --- Constants (Template Erişimi İçin) ---
    buildingsConfig = BUILDINGS_CONFIG;
    techConfig = TECH_CONFIG;
    unitConfig = UNIT_CONFIG;

    // --- Helper Lists (Template Döngüleri İçin) ---
    resourceBuildings = Object.entries(BUILDINGS_CONFIG).filter(([k, v]: any) => v.category === 'resource').map(([k]) => k);
    militaryBuildings = Object.entries(BUILDINGS_CONFIG).filter(([k, v]: any) => v.category === 'military').map(([k]) => k);
    infrastructureBuildings = Object.entries(BUILDINGS_CONFIG).filter(([k, v]: any) => v.category === 'infrastructure').map(([k]) => k);

    troopTechs = Object.entries(TECH_CONFIG).filter(([k, v]: any) => v.category === 'troop').map(([k]) => k);
    defenseTechs = Object.entries(TECH_CONFIG).filter(([k, v]: any) => v.category === 'defense').map(([k]) => k);

    sendTroopsTarget: { x: number, y: number } | null = null;
    mapVillages: VillageMapModel[] = [];

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.loadVillageData();
        this.getVillageData();
    }

    getVillageData() {
        this.apiService.getVillagesByWorldId(Number(localStorage.getItem('current_world_id') || 1)).subscribe({
            next: (data) => {
                this.mapVillages = data;
            }
        })
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }

    // --- DATA LOADING ---

    loadVillageData() {
        const villageId = localStorage.getItem('current_village_id');
        const userId = localStorage.getItem('user_id');

        if (!villageId || !userId) {
            this.router.navigate(['/worlds']);
            return;
        }

        // isLoading'i sadece ilk açılışta true yapalım ki refreshlerde ekran titremesin
        if (!this.village) this.isLoading = true;

        const vId = Number(villageId);

        forkJoin({
            village: this.apiService.getVillage(vId),
            constructions: this.apiService.getConstructions(vId),
            researches: this.apiService.getResearchQueue(vId),
            techLevels: this.apiService.getTechnologyLevels(vId),
            barracksQ: this.apiService.getRecruitQueue(vId, 'barracks'),
            stableQ: this.apiService.getRecruitQueue(vId, 'stable'),
            workshopQ: this.apiService.getRecruitQueue(vId, 'workshop'),
            movements: this.apiService.getOutgoingMovements(Number(userId)),
        }).subscribe({
            next: (data) => {
                this.village = data.village;
                this.constructions = data.constructions;
                this.researches = data.researches;
                this.techLevels = data.techLevels;
                this.barracksQueue = data.barracksQ;
                this.stableQueue = data.stableQ;
                this.workshopQueue = data.workshopQ;
                this.movements = data.movements;

                this.isLoading = false;
                this.error = '';

                // Veri geldikten sonra sayacı başlat/yenile
                this.startConstructionTimer();
            },
            error: (err) => {
                console.error(err);
                this.error = 'Veriler yüklenirken bir hata oluştu.';
                this.isLoading = false;
            }
        });
    }

    // --- TIMER & TIME FORMATTING ---

    stopTimer() {
        if (this.constructionTimer) {
            clearInterval(this.constructionTimer);
            this.constructionTimer = null;
        }
    }

    startConstructionTimer() {
        this.stopTimer();
        this.constructionTimer = setInterval(() => {
            this.constructions.forEach(c => {
                if (c.remainingSeconds > 0) {
                    c.remainingSeconds--;
                }
            });
        }, 1000);
    }

    // --- ACTIONS (API CALLS) ---

    handleBuildingUpgrade(type: string) {
        if (!this.village) return;

        this.upgradingBuilding = type;
        this.apiService.buildBuilding({
            villageId: this.village.id,
            buildingType: type as any
        }).subscribe({
            next: () => {
                this.loadVillageData();
            },
            error: (err) => console.error(err),
            complete: () => this.upgradingBuilding = null
        });
    }

    handleResearch(techType: string) {
        if (!this.village) return;

        this.researchingTech = techType;
        this.apiService.startResearch({
            villageId: this.village.id,
            unitType: techType as any
        }).subscribe({
            next: () => this.loadVillageData(),
            error: (err) => console.error(err),
            complete: () => this.researchingTech = null
        });
    }

    handleRecruit(unitType: string, amount: number) {
        if (!this.village) return;

        this.recruitingUnit = unitType;
        this.apiService.recruitUnits({
            villageId: this.village.id,
            unitType: unitType as any,
            amount: amount
        }).subscribe({
            next: () => this.loadVillageData(),
            error: (err) => console.error(err),
            complete: () => this.recruitingUnit = null
        });
    }

    handleLogout() {
        localStorage.clear();
        this.router.navigate(['/login']);
    }

    // --- HELPERS ---

    getBuildingLevel(type: string): number {
        if (!this.village) return 0;
        return (this.village.buildings as any)[type] || 0;
    }

    get allBuildingsList(): string[] {
        return Object.keys(this.buildingsConfig);
    }

    getIconForBuilding(type: string): string {
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
        return icons[type] || 'home';
    }

    // --- MODAL & NAVIGATION MANTIĞI ---

    handleBuildingClick(type: string) {
        // 1. Yönetim ve Askeriye -> Sekme Değiştir
        if (type === 'headquarters') {
            this.activeTab = 'buildings';
        } else if (['barracks', 'stable', 'workshop'].includes(type)) {
            this.activeTab = 'army';
        } else if (['academy', 'smithy'].includes(type)) {
            this.activeTab = 'research';
        }
        // 2. Diğerleri -> Bilgi Modalı Aç
        else {
            this.openBuildingInfoModal(type);
        }
    }

    openBuildingInfoModal(type: string) {
        const level = this.getBuildingLevel(type);
        const config = this.buildingsConfig[type];

        this.selectedBuildingInfo = {
            type: type,
            name: config.name,
            description: 'Bu binanın detaylı üretim ve kapasite bilgileri burada yer alır.',
            level: level
        };
    }

    closeBuildingInfoModal() {
        this.selectedBuildingInfo = null;
    }

    handleNavigateToCoordinates(x: number, y: number) {
        console.log(`Harita Hedefi Seçildi: ${x}|${y}`);

        // Hedef koordinatı set ediyoruz.
        // HTML tarafında *ngIf="sendTroopsTarget" olan bir dialog varsa o açılacaktır.
        this.sendTroopsTarget = { x, y };
    }

    // Dialog kapatma fonksiyonu (İleride dialog component'i yapınca lazım olacak)
    onSendTroopsClose() {
        this.sendTroopsTarget = null;
    }

    // Dialog işlemi başarılı biterse (Asker gönderilirse)
    onSendTroopsSuccess() {
        this.sendTroopsTarget = null;
        this.loadVillageData(); // Verileri tazele (Hareketleri güncellemek için)
    }

    // 1. Demirci kontrolü için getter
    get hasSmithy(): boolean {
        return this.getBuildingLevel('smithy') > 0;
    }

    get researchableUnits(): Array<{type: string, config: any}> {
        // Sadece askeri birlikleri filtreleyip döndürüyoruz
        return Object.entries(this.unitConfig)
            .filter(([key, val]: any) => key !== 'WALL') // Duvar araştırılmaz, inşa edilir
            .map(([key, val]) => ({ type: key, config: val }));
    }

    getTechLevel(unitType: string): number {
        // techLevels objesinden veya 0
        return this.techLevels && this.techLevels[unitType] ? this.techLevels[unitType] : 0;
    }

    canAffordResearch(cost: { wood: number, meat: number, iron: number }): boolean {
        if (!this.village) return false;
        return this.village.resources.woodAmount >= cost.wood &&
            this.village.resources.meatAmount >= cost.meat &&
            this.village.resources.ironAmount >= cost.iron;
    }

    buildingPositions: { [key: string]: { left: number; top: number; width: number; height: number } } = {
        // --- KÖŞELER (ÜRETİM TESİSLERİ) ---

        // 1. Sol Üst: Demir Madeni
        'ironMine':     { left: 8, top: 12, width: 12, height: 12 },

        // 2. Sağ Üst: Çiftlik
        'farm':         { left: 90, top: 15, width: 14, height: 14 },

        // 3. Sol Alt: Et Tesisi (Eski Kil Ocağı yeri)
        'meatPlant':    { left: 6, top: 82, width: 12, height: 12 },

        // 4. Sağ Alt: Odun Kampı
        'timberCamp':   { left: 90, top: 85, width: 12, height: 12 },


        // --- MERKEZ BİNALAR (İÇERİSİ) ---

        // 5. Tam Orta: Karargah (Kale)
        'headquarters': { left: 62, top: 25, width: 12, height: 12 },

        // 6. Sol Taraf: Depo (Uzun bina)
        'warehouse':    { left: 28, top: 42, width: 12, height: 10 },

        // 7. Orta Sol: Pazar (Çadırlı alan)
        'market':       { left: 45, top: 37, width: 8, height: 8 },

        // 8. Sol Alt İç: Demirci
        'smithy':       { left: 38, top: 73, width: 10, height: 10 },

        // 9. Sağ Alt İç: Kışla
        'barracks':     { left: 75, top: 57, width: 12, height: 12 },

        'wall':     { left: 75, top: 90, width: 12, height: 12 },

        // NOT: 'stable' (Ahır), 'workshop' (Atölye) ve 'academy' (Akademi) için
        // haritada boş bir yer belirleyip buraya ekleyebilirsin.
        // Şimdilik kalabalık olmasın diye eklemedim.
    };

    getBuildingStyle(type: string) {
        const pos = this.buildingPositions[type];
        if (!pos) return { display: 'none' };

        return {
            'left.%': pos.left,
            'top.%': pos.top,
            'width.%': pos.width,
            'height.%': pos.height
        };
    }

    getBuildingsByCategory(category: string): string[] {
        return Object.keys(this.buildingsConfig).filter(key => this.buildingsConfig[key].category === category);
    }

    troopConfig: any = {
        spearmen: { name: 'Mızrakçı', icon: 'sword' },
        swordsmen: { name: 'Kılıç Ustası', icon: 'sword' },
        axemen: { name: 'Baltacı', icon: 'axe' },
        archers: { name: 'Okçu', icon: 'crosshair' },
        scouts: { name: 'Casus', icon: 'eye' },
        lightCavalry: { name: 'Hafif Atlı', icon: 'feather' },
        heavyCavalry: { name: 'Ağır Atlı', icon: 'shield' },
        rams: { name: 'Şahmerdan', icon: 'hammer' },
        catapults: { name: 'Mancınık', icon: 'target' },
        conquerors: { name: 'Misyoner', icon: 'crown' }
    };

// Askerleri belirli bir sırada göstermek için liste
    troopKeys = Object.keys(this.troopConfig);

    getTroopCount(key: string): number {
        // Burada 'as any' diyerek TypeScript'e "Sen karışma, ben ne yaptığımı biliyorum" diyoruz.
        return (this.village?.troops as any)[key] || 0;
    }
}
