import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorldModel } from '../../core/models/api.models';

@Component({
    selector: 'app-admin-worlds',
    templateUrl: './admin-worlds.component.html',
    styles: [`
        :host { display: block; }
    `]
})
export class AdminWorldsComponent implements OnInit {
    worlds: WorldModel[] = [];
    isLoading = false;

    // Create Modal ve Form
    isModalOpen = false;
    createForm: FormGroup;

    // --- CONFIRM MODAL STATE (YENİ) ---
    confirmModal = {
        isOpen: false,
        title: '',
        message: '',
        type: 'danger' as 'danger' | 'warning', // Buton rengi için (Kırmızı/Sarı)
        action: () => {} // Onaylanınca çalışacak fonksiyon
    };

    constructor(
        private apiService: ApiService,
        private fb: FormBuilder
    ) {
        this.createForm = this.fb.group({
            name: ['', Validators.required],
            speed: [1, [Validators.required, Validators.min(1)]],
        });
    }

    ngOnInit() {
        this.loadWorlds();
    }

    loadWorlds() {
        this.isLoading = true;
        this.apiService.getAllWorlds().subscribe({
            next: (data) => {
                this.worlds = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Dünyalar yüklenemedi", err);
                this.isLoading = false;
            }
        });
    }

    // --- DELETE İŞLEMİ (Diyaloglu) ---
    requestDeleteWorld(id: number) {
        this.confirmModal = {
            isOpen: true,
            title: 'Dünyayı Sil',
            message: 'DİKKAT! Bu dünyayı ve içindeki TÜM oyuncu/köy verilerini kalıcı olarak silmek üzeresin. Bu işlem geri alınamaz.',
            type: 'danger',
            action: () => {
                this.apiService.deleteWorld(id).subscribe(() => {
                    this.worlds = this.worlds.filter(w => w.id !== id);
                    this.closeConfirmModal();
                });
            }
        };
    }

    // --- PASİFLEŞTİRME İŞLEMİ (Diyaloglu) ---
    requestDeactivateWorld(id: number) {
        this.confirmModal = {
            isOpen: true,
            title: 'Dünyayı Pasifleştir',
            message: 'Bu dünyayı pasifleştirmek istiyor musun? Yeni oyuncu girişi kapanacak.',
            type: 'warning',
            action: () => {
                this.apiService.deactivateWorld(id).subscribe((updatedWorld) => {
                    const index = this.worlds.findIndex(w => w.id === id);
                    if (index !== -1) {
                        this.worlds[index] = updatedWorld;
                    }
                    this.closeConfirmModal();
                });
            }
        };
    }

    // --- CONFIRM MODAL KONTROLLERİ ---
    closeConfirmModal() {
        this.confirmModal.isOpen = false;
    }

    onConfirmAction() {
        this.confirmModal.action();
    }

    // --- CREATE MODAL İŞLEMLERİ ---

    openCreateModal() {
        this.createForm.reset({ speed: 1 });
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    onCreateSubmit() {
        if (this.createForm.invalid) return;

        const newWorld: WorldModel = this.createForm.value;

        newWorld.active = true;

        this.apiService.createWorld(newWorld).subscribe({
            next: (created) => {
                this.worlds.push(created);
                this.closeModal();
            },
            error: (err) => console.error("Oluşturma hatası", err)
        });
    }
}
