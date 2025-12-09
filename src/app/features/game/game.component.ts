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

    isLoading = true;
    error = '';
    activeTab = 'overview'; // 'overview' | 'buildings' | 'research' | 'army' | 'map'

    selectedBuildingInfo: any = null;

    upgradingBuilding: string | null = null;

    private constructionTimer: any;

    buildingsConfig = BUILDINGS_CONFIG;

    private resourceInterval: any;

    sendTroopsTarget: { x: number, y: number } | null = null;
    mapVillages: VillageMapModel[] = [];

    villageId: any;

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
        this.stopResourceTimer();
    }

    startResourceSimulation() {
        // Eğer hali hazırda bir interval varsa önce temizle
        this.stopResourceTimer();

        // Her 1 saniyede (1000ms) bir çalışacak fonksiyon
        this.resourceInterval = setInterval(() => {
            if (this.village && this.village.resources) {

                // Kolay erişim için kapasiteyi değişkene alalım
                const capacity = this.village.resources.storageCapacity;

                // --- Hesaplamalar ---
                const woodPerSecond = this.village.resources.woodHourlyProduction / 3600;
                const meatPerSecond = this.village.resources.meatHourlyProduction / 3600;
                const ironPerSecond = this.village.resources.ironHourlyProduction / 3600;

                this.village.resources.woodAmount = Math.min(
                    this.village.resources.woodAmount + woodPerSecond,
                    capacity
                );

                this.village.resources.meatAmount = Math.min(
                    this.village.resources.meatAmount + meatPerSecond,
                    capacity
                );

                this.village.resources.ironAmount = Math.min(
                    this.village.resources.ironAmount + ironPerSecond,
                    capacity
                );
            }
        }, 1000);
    }

    stopResourceTimer() {
        if (this.resourceInterval) {
            clearInterval(this.resourceInterval);
        }
    }


    loadVillageData() {
        const villageId = localStorage.getItem('current_village_id');
        this.villageId = villageId;
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
                this.startResourceSimulation();
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
        this.sendTroopsTarget = { x, y };
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
        'warehouse':    { left: 18, top: 40, width: 12, height: 10 },

        // 7. Orta Sol: Pazar (Çadırlı alan)
        'market':       { left: 45, top: 37, width: 8, height: 8 },

        // 8. Sol Alt İç: Demirci
        'smithy':       { left: 38, top: 73, width: 10, height: 10 },

        // 9. Sağ Alt İç: Kışla
        'barracks':     { left: 75, top: 40, width: 12, height: 12 },

        'wall':     { left: 73, top: 87, width: 12, height: 12 },

        'stable':     { left: 70, top: 65, width: 12, height: 12 },

        'workshop':     { left: 20, top: 60, width: 12, height: 12 },

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
