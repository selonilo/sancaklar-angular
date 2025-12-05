export const BUILDINGS_CONFIG: any = {
  headquarters: { name: 'Karargah', category: 'infrastructure' },
  barracks: { name: 'Kışla', category: 'military' },
  stable: { name: 'Ahır', category: 'military' },
  workshop: { name: 'Atölye', category: 'military' },
  academy: { name: 'Akademi', category: 'infrastructure' },
  smithy: { name: 'Demirci', category: 'military' },
  market: { name: 'Pazar', category: 'infrastructure' },
  timberCamp: { name: 'Odun Kampı', category: 'resource' },
  meatPlant: { name: 'Et Tesisi', category: 'resource' },
  ironMine: { name: 'Demir Madeni', category: 'resource' },
  farm: { name: 'Çiftlik', category: 'resource' },
  warehouse: { name: 'Depo', category: 'infrastructure' },
  wall: { name: 'Sur', category: 'military' }
};

export const TECH_CONFIG: any = {
  // Askeri
  SPEARMAN: { name: 'Mızraklı', category: 'troop' },
  SWORDSMAN: { name: 'Kılıç Ustası', category: 'troop' },
  AXEMAN: { name: 'Baltacı', category: 'troop' },
  ARCHER: { name: 'Okçu', category: 'troop' },
  SCOUT: { name: 'Casus', category: 'troop' },
  LIGHT_CAVALRY: { name: 'Hafif Atlı', category: 'troop' },
  HEAVY_CAVALRY: { name: 'Ağır Atlı', category: 'troop' },
  RAM: { name: 'Şahmerdan', category: 'troop' },
  CATAPULT: { name: 'Mancınık', category: 'troop' },
  CONQUEROR: { name: 'Fatih', category: 'troop' },
  // Savunma (Örnek)
  WALL: { name: 'Sur Teknolojisi', category: 'defense' }
};

export const UNIT_CONFIG: any = {
  SPEARMAN: { name: 'Mızraklı', buildingType: 'barracks' },
  SWORDSMAN: { name: 'Kılıç Ustası', buildingType: 'barracks' },
  AXEMAN: { name: 'Baltacı', buildingType: 'barracks' },
  ARCHER: { name: 'Okçu', buildingType: 'barracks' },
  SCOUT: { name: 'Casus', buildingType: 'stable' },
  LIGHT_CAVALRY: { name: 'Hafif Atlı', buildingType: 'stable' },
  HEAVY_CAVALRY: { name: 'Ağır Atlı', buildingType: 'stable' },
  RAM: { name: 'Şahmerdan', buildingType: 'workshop' },
  CATAPULT: { name: 'Mancınık', buildingType: 'workshop' },
  CONQUEROR: { name: 'Fatih', buildingType: 'academy' }
};
