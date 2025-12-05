// src/app/features/worlds/worlds.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorldModel, RegionDirection, JoinWorldRequest } from '../../core/models/api.models';

@Component({
  selector: 'app-worlds',
  templateUrl: './worlds.component.html',
  styleUrls: ['./worlds.component.scss']
})
export class WorldsComponent implements OnInit {
  worlds: WorldModel[] = [];
  isLoading = true;
  error = '';

  // Dialog State
  selectedWorld: WorldModel | null = null;
  selectedRegion: RegionDirection | null = null;

  isEntering = false;
  currentUserId: number | null = null;
  currentUsername: string = ''; // Opsiyonel, localStorage'da varsa

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // User ID kontrolü
    const storedId = localStorage.getItem('user_id');
    if (!storedId) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = Number(storedId);

    // Varsa kullanıcı adını da alalım (göstermelik)
    // Gerçek bir AuthState servisi olsa daha iyi olur ama şimdilik böyle:
    // this.currentUsername = localStorage.getItem('username') || 'Lordum';

    this.loadWorlds();
  }

  loadWorlds() {
    if (!this.currentUserId) return;

    this.isLoading = true;
    this.apiService.getActiveWorlds(this.currentUserId).subscribe({
      next: (data) => {
        this.worlds = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Dünyalar yüklenemedi';
        this.isLoading = false;
      }
    });
  }

  handleWorldClick(world: WorldModel) {
    // Eğer world modelinde 'joining' diye bir alan yoksa backend modeline eklemelisin.
    // React kodunda 'joining' (zaten katılmış mı?) kontrolü vardı.
    // Şimdilik API modelimizde 'joining' boolean'ı olduğunu varsayıyoruz.

    if (world.joining) {
      // Zaten katılmış, direkt gir
      this.handleDirectEnter(world);
    } else {
      // Yeni dünya, modal aç
      this.selectedWorld = world;
      this.selectedRegion = null;
    }
  }

  handleDirectEnter(world: WorldModel) {
    if (!this.currentUserId) return;
    this.enterWorldApiCall(world, 'RANDOM');
  }

  handleEnterWorldFromDialog() {
    if (!this.selectedWorld || !this.selectedRegion || !this.currentUserId) return;
    this.enterWorldApiCall(this.selectedWorld, this.selectedRegion);
  }

  private enterWorldApiCall(world: WorldModel, direction: RegionDirection) {
    if (!this.currentUserId) return;

    this.isEntering = true;
    this.error = '';

    const request: JoinWorldRequest = {
      userId: this.currentUserId,
      worldId: world.id,
      direction: direction
    };

    this.apiService.enterWorld(request).subscribe({
      next: (village) => {
        // ApiService içinde localStorage'a village_id kaydedildi.
        // Ayrıca hangi dünyada olduğunu da kaydedelim
        localStorage.setItem('current_world_id', world.id.toString());

        // Oyuna yönlendir
        this.router.navigate(['/game']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Dünyaya giriş başarısız';
        this.isEntering = false;
      },
      complete: () => {
        // Başarılı olursa zaten sayfa değişiyor, loading false yapmaya gerek kalmayabilir
        // Ama hata durumunda kalırsa diye:
        if(this.error) this.isEntering = false;
      }
    });
  }

  handleLogout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  closeDialog() {
    this.selectedWorld = null;
    this.selectedRegion = null;
  }
}
