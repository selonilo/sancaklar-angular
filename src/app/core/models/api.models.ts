// src/app/core/models/api.models.ts

// --- ENUMS (Sabit Değerler) ---

export type RegionDirection = "RANDOM" | "NORTH" | "SOUTH" | "WEST" | "EAST";

export type BuildingType =
    | "headquarters"
    | "barracks"
    | "stable"
    | "workshop"
    | "academy"
    | "smithy"
    | "market"
    | "timberCamp"
    | "meatPlant"
    | "ironMine"
    | "farm"
    | "warehouse"
    | "wall";

export type UnitType =
    | "SPEARMAN"
    | "SWORDSMAN"
    | "AXEMAN"
    | "ARCHER"
    | "SCOUT"
    | "LIGHT_CAVALRY"
    | "HEAVY_CAVALRY"
    | "RAM"
    | "CATAPULT"
    | "CONQUEROR"
    | "WALL"; // Schema'da WALL da var

export type MovementType = "ATTACK" | "SUPPORT" | "RETURN";

// --- AUTH & USER MODELS ---

export interface UserModel {
    id?: number;
    createdDate?: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    username: string;
    email: string;
    password?: string; // Request'te lazım, response'da gelmeyebilir
}

export interface LoginModel {
    username: string;
    password: string;
}

export interface TokenModel {
    token: string;
    user: UserModel;
}

export interface PasswordRefreshModel {
    mail: string;
}

export interface ResponseMessageModel {
    message: string;
}

// --- WORLD MODELS ---

export interface WorldModel {
    id: number;
    name: string;
    speed: number;
    active: boolean;
    joining: boolean;
}

export interface JoinWorldRequest {
    userId: number;
    worldId: number;
    direction: RegionDirection;
}

// --- VILLAGE & SUB-MODELS ---

export interface VillageBuildingsModel {
    // Binaların Seviyeleri
    headquarters: number;
    barracks: number;
    stable: number;
    workshop: number;
    academy: number;
    smithy: number;
    market: number;
    timberCamp: number;
    meatPlant: number;
    ironMine: number;
    farm: number;
    warehouse: number;
    wall: number;

    // Maliyetler ve Süreler (Flattened Structure)
    headquartersCostWood: number;
    headquartersCostMeat: number;
    headquartersCostIron: number;
    headquartersDuration: number;
    headquartersTargetLevel: number;

    barracksCostWood: number;
    barracksCostMeat: number;
    barracksCostIron: number;
    barracksDuration: number;
    barracksTargetLevel: number;

    stableCostWood: number;
    stableCostMeat: number;
    stableCostIron: number;
    stableDuration: number;
    stableTargetLevel: number;

    workshopCostWood: number;
    workshopCostMeat: number;
    workshopCostIron: number;
    workshopDuration: number;
    workshopTargetLevel: number;

    academyCostWood: number;
    academyCostMeat: number;
    academyCostIron: number;
    academyDuration: number;
    academyTargetLevel: number;

    smithyCostWood: number;
    smithyCostMeat: number;
    smithyCostIron: number;
    smithyDuration: number;
    smithTargetLevel: number;

    marketCostWood: number;
    marketCostMeat: number;
    marketCostIron: number;
    marketDuration: number;
    marketTargetLevel: number;

    timberCampCostWood: number;
    timberCampCostMeat: number;
    timberCampCostIron: number;
    timberCampDuration: number;
    timberTargetLevel: number;

    meatPlantCostWood: number;
    meatPlantCostMeat: number;
    meatPlantCostIron: number;
    meatPlantDuration: number;
    meatPlantTargetLevel: number;

    ironMineCostWood: number;
    ironMineCostMeat: number;
    ironMineCostIron: number;
    ironMineDuration: number;
    ironMineTargetLevel: number;

    farmCostWood: number;
    farmCostMeat: number;
    farmCostIron: number;
    farmDuration: number;
    farmTargetLevel: number;

    warehouseCostWood: number;
    warehouseCostMeat: number;
    warehouseCostIron: number;
    warehouseDuration: number;
    warehouseTargetLevel: number;

    wallCostWood: number;
    wallCostMeat: number;
    wallCostIron: number;
    wallDuration: number;
    wallTargetLevel: number;
}

export interface VillageResourcesModel {
    woodAmount: number;
    meatAmount: number;
    ironAmount: number;
    storageCapacity: number;
    lastUpdated: string;
    woodHourlyProduction: number;
    meatHourlyProduction: number;
    ironHourlyProduction: number;
}

export interface VillageTroopsModel {
    spearmen: number;
    swordsmen: number;
    axemen: number;
    archers: number;
    scouts: number;
    lightCavalry: number;
    heavyCavalry: number;
    rams: number;
    catapults: number;
    conquerors: number;
}

export interface VillageResearchesModel {
    spearman: number;
    swordsman: number;
    axeman: number;
    archer: number;
    scout: number;
    lightCavalry: number;
    heavyCavalry: number;
    ram: number;
    catapult: number;
    conqueror: number;
}

export interface VillageModel {
    id: number;
    name: string;
    points: number;
    loyalty: number;
    playerId: number;
    playerName: string;
    buildings: VillageBuildingsModel;
    resources: VillageResourcesModel;
    troops: VillageTroopsModel;
    researches: VillageResearchesModel;
    xcoord: number;
    ycoord: number;
}

// --- ACTIONS & REQUESTS ---

export interface UpgradeBuildingRequest {
    villageId: number;
    buildingType: BuildingType;
}

export interface ResearchRequest {
    villageId: number;
    unitType: UnitType; // Backend "unitType" demiş, research için bu kullanılıyor
}

export interface RecruitRequest {
    villageId: number;
    unitType: UnitType;
    amount: number;
}

export interface SendTroopsRequest {
    sourceVillageId: number;
    targetVillageId: number;
    type: MovementType;
    spearmenAmount: number;
    swordsmanAmount: number;
    axemanAmount: number;
    archerAmount: number;
    scoutAmount: number;
    lightCavalryAmount: number;
    heavyCavalryAmount: number;
    ramAmount: number;
    catapultAmount: number;
    conquerorAmount: number;
}

// --- QUEUES & TRACKERS ---

export interface ConstructionModel {
    id: number;
    buildingType: BuildingType;
    targetLevel: number;
    startTime: string;
    completionTime: string;
    remainingSeconds: number;
}

export interface ResearchQueueModel {
    id: number;
    unitType: UnitType;
    startTime: string;
    completionTime: string;
    remainingSeconds: number;
}

export interface UnitRecruitmentModel {
    id: number;
    unitType: UnitType;
    quantity: number;
    completionTime: string;
    remainingSeconds: number;
}

export interface MovementTrackerModel {
    movementId: number;
    sourceVillageId: number;
    targetVillageId: number;
    targetVillageName: string;
    type: MovementType;
    arrivalTime: string;
}

export interface VillageMapModel {
    id: number;
    name: string;
    xcoord: number;
    ycoord: number;
    points: number;
    playerId: number;
    playerName: string;
    allianceName?: string;
}

export interface ActiveCountModel {
    activeUser: number;
    village: number;
    world: number;
}
