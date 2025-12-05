import {
    Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter,
    HostListener, NgZone, ChangeDetectionStrategy, inject, ElementRef
} from '@angular/core';
import {VillageMapModel} from "../../../core/models/api.models";
@Component({
    selector: 'app-world-map',
    templateUrl: './world-map.component.html',
    styleUrls: ['./world-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapComponent implements OnInit, OnChanges {
    @Input() villages: VillageMapModel[] = [];
    @Input() currentPlayerId: number = 0;
    @Input() centerX!: number;
    @Input() centerY!: number;
    @Output() onNavigate = new EventEmitter<{x: number, y: number}>();

    // --- İç Değişkenler ---
    tileSize = 50;
    worldSize = 200;
    minimapSize = 180;

    scale = 1;
    offsetX = -5000; // Varsayılan değer, ngOnInit'te ezilecek
    offsetY = -5000;

    isDragging = false;
    lastMouseX = 0;
    lastMouseY = 0;

    selectedVillage: VillageMapModel | null = null;
    popupPosition = { x: 0, y: 0 };

    private elementRef = inject(ElementRef);

    ngOnInit() {
        // Eğer dışarıdan merkez gelmediyse varsayılan 100|100 yap
        if (!this.centerX) this.centerX = 100;
        if (!this.centerY) this.centerY = 100;

        // Haritayı Input olarak gelen konuma odakla
        this.centerMapTo(this.centerX, this.centerY);
    }

    ngOnChanges(changes: SimpleChanges) {
        // Eğer parent component centerX veya centerY'yi değiştirirse haritayı oraya odakla
        if (changes['centerX'] || changes['centerY']) {
            // Sadece değerler tanımlıysa işlem yap
            if (this.centerX !== undefined && this.centerY !== undefined) {
                this.centerMapTo(this.centerX, this.centerY);
            }
        }
    }

    // --- Harita Hareketi (Drag & Pan) ---

    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        const target = event.target as HTMLElement;
        // Popup veya köye tıklanmadıysa seçimi kaldır
        if (!target.closest('.map-popup') && !target.closest('.village-tile')) {
            this.selectedVillage = null;
        }
    }

    @HostListener('window:mouseup')
    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            // Sürükleme bittiğinde yeni merkezi parent'a bildir
            const center = this.getCurrentCenter();
            this.onNavigate.emit(center);
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        event.preventDefault();

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.offsetX += deltaX;
        this.offsetY += deltaY;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    // --- Dokunmatik Kontroller (Mobil) ---
    onTouchStart(event: TouchEvent) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = event.touches[0].clientX;
            this.lastMouseY = event.touches[0].clientY;
        }
    }

    @HostListener('window:touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        if (!this.isDragging || event.touches.length !== 1) return;
        const touch = event.touches[0];
        this.offsetX += touch.clientX - this.lastMouseX;
        this.offsetY += touch.clientY - this.lastMouseY;
        this.lastMouseX = touch.clientX;
        this.lastMouseY = touch.clientY;
    }

    @HostListener('window:touchend')
    onTouchEnd() {
        if(this.isDragging) {
            this.isDragging = false;
            const center = this.getCurrentCenter();
            this.onNavigate.emit(center);
        }
    }

    // --- Zoom ---
    onWheel(event: WheelEvent) {
        event.preventDefault();
        const zoomIntensity = 0.1;
        const direction = event.deltaY > 0 ? -1 : 1;
        let newScale = this.scale + (direction * zoomIntensity);
        newScale = Math.min(Math.max(0.3, newScale), 2);
        this.scale = newScale;
    }

    // --- Mantıksal Fonksiyonlar ---

    centerMapTo(tileX: number, tileY: number) {
        // Element henüz render olmadıysa varsayılan window boyutlarını kullan
        const el = this.elementRef.nativeElement;
        const viewportW = el.offsetWidth || window.innerWidth;
        const viewportH = el.offsetHeight || window.innerHeight;

        // Formül: -(KareKonumu * KareBoyutu) + (EkranYarısı) - (KareYarısı)
        this.offsetX = -(tileX * this.tileSize) + (viewportW / 2) - (this.tileSize / 2);
        this.offsetY = -(tileY * this.tileSize) + (viewportH / 2) - (this.tileSize / 2);
    }

    getCurrentCenter() {
        const el = this.elementRef.nativeElement;
        const viewportW = el.offsetWidth || window.innerWidth;
        const viewportH = el.offsetHeight || window.innerHeight;

        // Tersten işlem: Ekranın ortasındaki pikselin harita üzerindeki konumu
        const centerXPixel = -this.offsetX + (viewportW / 2);
        const centerYPixel = -this.offsetY + (viewportH / 2);

        return {
            x: Math.floor(centerXPixel / this.tileSize),
            y: Math.floor(centerYPixel / this.tileSize)
        };
    }

    selectVillage(village: VillageMapModel, event: MouseEvent) {
        event.stopPropagation();
        this.selectedVillage = village;

        // Popup pozisyonunu hesapla
        const mapPixelX = (village.xcoord * this.tileSize * this.scale) + this.offsetX;
        const mapPixelY = (village.ycoord * this.tileSize * this.scale) + this.offsetY;

        this.popupPosition = {
            x: mapPixelX + (40 * this.scale),
            y: mapPixelY - (20 * this.scale)
        };
    }

    closePopup() { this.selectedVillage = null; }

    // --- Renk ve Minimap ---

    getPlayerColor(playerId: number | null): string {
        // 1. Kendi köyünse BEYAZ
        if (playerId === this.currentPlayerId) return '#ffffff';

        // 2. Barbar köyüyse (Player yoksa) GRİ / TAŞ RENGİ
        if (!playerId) return '#9ca3af'; // Tailwind Gray-400 gibi

        // 3. Diğer oyuncular için sabit renk algoritması
        const colors = ['#e53935', '#fb8c00', '#8e24aa', '#00897b', '#3949ab', '#d81b60'];
        return colors[playerId % colors.length];
    }

    onMinimapClick(event: MouseEvent) {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const percentX = clickX / this.minimapSize;
        const percentY = clickY / this.minimapSize;

        const targetTileX = Math.floor(percentX * this.worldSize);
        const targetTileY = Math.floor(percentY * this.worldSize);

        this.centerMapTo(targetTileX, targetTileY);

        // Navigasyon eventini tetikle
        this.onNavigate.emit({x: targetTileX, y: targetTileY});
    }

    getViewportIndicator() {
        const el = this.elementRef.nativeElement;
        const viewportW = el.offsetWidth || window.innerWidth;
        const viewportH = el.offsetHeight || window.innerHeight;

        const totalWorldPixels = this.worldSize * this.tileSize;
        const ratio = this.minimapSize / totalWorldPixels;

        const worldX = -this.offsetX;
        const worldY = -this.offsetY;

        return {
            x: worldX * ratio,
            y: worldY * ratio,
            w: (viewportW / this.scale) * ratio,
            h: (viewportH / this.scale) * ratio
        };
    }

    trackByVillage(index: number, item: VillageMapModel) { return item.id; }
}
