// src/app/core/services/api.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import * as Models from '../models/api.models';
import {ActiveCountModel} from "../models/api.models";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly API_BASE_URL = "http://localhost:9898";

    constructor(private http: HttpClient) {
    }

    private getHeaders(includeAuth = false): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (includeAuth) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return headers;
    }

    // --- AUTH ---

    login(credentials: Models.LoginModel): Observable<Models.TokenModel> {
        return this.http.post<Models.TokenModel>(
            `${this.API_BASE_URL}/api/auth/login`,
            credentials
        ).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('auth_token', response.token);
                    // User objesi artık TokenModel içinde geliyor
                    if (response.user && response.user.id) {
                        localStorage.setItem('user_id', response.user.id.toString());
                    }
                }
            })
        );
    }

    // Register için UserModel kullanıyoruz (Password içeriyor)
    register(data: Models.UserModel): Observable<Models.TokenModel> {
        return this.http.post<Models.TokenModel>(
            `${this.API_BASE_URL}/api/auth/register`,
            data
        ).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('auth_token', response.token);
                    if (response.user && response.user.id) {
                        localStorage.setItem('user_id', response.user.id.toString());
                    }
                }
            })
        );
    }

    getUserById(id: number): Observable<Models.UserModel> {
        return this.http.get<Models.UserModel>(
            `${this.API_BASE_URL}/api/auth/getById/${id}`,
            {headers: this.getHeaders(true)}
        );
    }

    updateUser(data: Models.UserModel): Observable<Models.UserModel> {
        return this.http.put<Models.UserModel>(
            `${this.API_BASE_URL}/api/auth/update`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    refreshPassword(data: Models.PasswordRefreshModel): Observable<Models.ResponseMessageModel> {
        return this.http.post<Models.ResponseMessageModel>(
            `${this.API_BASE_URL}/api/auth/refreshPassword`,
            data,
            {headers: this.getHeaders(false)}
        );
    }

    // --- WORLD ---

    getActiveWorlds(userId: number): Observable<Models.WorldModel[]> {
        return this.http.get<Models.WorldModel[]>(
            `${this.API_BASE_URL}/api/world/active/${userId}`,
            {headers: this.getHeaders(true)}
        );
    }

    enterWorld(data: Models.JoinWorldRequest): Observable<Models.VillageModel> {
        return this.http.post<Models.VillageModel>(
            `${this.API_BASE_URL}/api/world/enter-world`,
            data,
            {headers: this.getHeaders(true)}
        ).pipe(
            tap((response: any) => {
                const village = Array.isArray(response) ? response[0] : response;
                if (village && village.id) {
                    localStorage.setItem("current_village_id", village.id.toString());
                }
            })
        );
    }

    // --- VILLAGE ---

    getVillage(villageId: number): Observable<Models.VillageModel> {
        return this.http.get<Models.VillageModel>(
            `${this.API_BASE_URL}/api/village/${villageId}`,
            {headers: this.getHeaders(true)}
        );
    }

    getConstructions(villageId: number): Observable<Models.ConstructionModel[]> {
        return this.http.get<Models.ConstructionModel[]>(
            `${this.API_BASE_URL}/api/village/constructions/${villageId}`,
            {headers: this.getHeaders(true)}
        );
    }

    buildBuilding(data: Models.UpgradeBuildingRequest): Observable<Models.ConstructionModel> {
        return this.http.post<Models.ConstructionModel>(
            `${this.API_BASE_URL}/api/village/build`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    // --- RECRUIT ---

    recruitUnits(data: Models.RecruitRequest): Observable<Models.UnitRecruitmentModel> {
        return this.http.post<Models.UnitRecruitmentModel>(
            `${this.API_BASE_URL}/api/recruit`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    getRecruitQueue(villageId: number, buildingType: string): Observable<Models.UnitRecruitmentModel[]> {
        return this.http.get<Models.UnitRecruitmentModel[]>(
            `${this.API_BASE_URL}/api/recruit/${villageId}/queue/${buildingType}`,
            {headers: this.getHeaders(true)}
        );
    }

    // --- RESEARCH ---

    startResearch(data: Models.ResearchRequest): Observable<Models.ResearchQueueModel> {
        return this.http.post<Models.ResearchQueueModel>(
            `${this.API_BASE_URL}/api/research/start`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    getResearchQueue(villageId: number): Observable<Models.ResearchQueueModel[]> {
        return this.http.get<Models.ResearchQueueModel[]>(
            `${this.API_BASE_URL}/api/research/${villageId}/queue`,
            {headers: this.getHeaders(true)}
        );
    }

    getTechnologyLevels(villageId: number): Observable<Models.VillageResearchesModel> {
        // Bu endpoint'in dönüş tipi şemada explicit yok ama VillageResearchesModel ile uyumludur muhtemelen
        return this.http.get<Models.VillageResearchesModel>(
            `${this.API_BASE_URL}/api/research/${villageId}/levels`,
            {headers: this.getHeaders(true)}
        );
    }

    // --- MOVEMENT ---

    sendMovement(data: Models.SendTroopsRequest): Observable<Models.MovementTrackerModel> {
        return this.http.post<Models.MovementTrackerModel>(
            `${this.API_BASE_URL}/api/movement/send`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    getOutgoingMovements(playerId: number): Observable<Models.MovementTrackerModel[]> {
        return this.http.get<Models.MovementTrackerModel[]>(
            `${this.API_BASE_URL}/api/movement/outgoing/${playerId}`,
            {headers: this.getHeaders(true)}
        );
    }

    getVillagesByWorldId(worldId: number): Observable<Models.VillageMapModel[]> {
        return this.http.get<Models.VillageMapModel[]>(
            `${this.API_BASE_URL}/api/village/getListByWorldId/${worldId}`,
            {headers: this.getHeaders(true)}
        );
    }

    cancelConstruction(constructionId: number) {
        return this.http.delete<void>(
            `${this.API_BASE_URL}/api/village/cancelConstruction/${constructionId}`,
            {headers: this.getHeaders(true)}
        );
    }

    getActiveCount(): Observable<ActiveCountModel> {
        // Backend'deki Controller path'ine göre burayı düzenle.
        // Örn: StatisticController ise '/api/statistic/activeCount' olabilir.
        return this.http.get<ActiveCountModel>(
            `${this.API_BASE_URL}/api/statistic/activeCount`,
            {headers: this.getHeaders(false)}
        );
    }

    // Admin: Create World

    // Tüm dünyaları getir (Admin için)
    getAllWorlds(): Observable<Models.WorldModel[]> {
        return this.http.get<Models.WorldModel[]>(
            `${this.API_BASE_URL}/api/world/all`,
            {headers: this.getHeaders(true)}
        );
    }

    // Yeni Dünya Ekle
    createWorld(data: Models.WorldModel): Observable<Models.WorldModel> {
        return this.http.post<Models.WorldModel>(
            `${this.API_BASE_URL}/api/world/add`,
            data,
            {headers: this.getHeaders(true)}
        );
    }

    // Dünyayı Sil
    deleteWorld(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.API_BASE_URL}/api/world/${id}`,
            {headers: this.getHeaders(true)}
        );
    }

    // Dünyayı Pasifleştir
    deactivateWorld(id: number): Observable<Models.WorldModel> {
        return this.http.put<Models.WorldModel>(
            `${this.API_BASE_URL}/api/world/${id}/deactivate`,
            {},
            {headers: this.getHeaders(true)}
        );
    }

    updateVillage(village: Models.VillageModel): Observable<void> {
        return this.http.put<void>(
            `${this.API_BASE_URL}/api/village/update`,
            village,
            { headers: this.getHeaders(true) }
        );
    }
}
