export enum MemberType {
  REGULAR = 'สมาชิกสามัญ',
  ASSOCIATE = 'สมาชิกสมทบ'
}

export enum DamageLevel {
  LEVEL_1 = 'Level 1 - น้อย (Minor Damage)',
  LEVEL_2 = 'Level 2 - ปานกลาง (Moderate Damage)',
  LEVEL_3 = 'Level 3 - รุนแรง (Severe Damage)',
  LEVEL_4 = 'Level 4 - ร้ายแรงมาก (Critical Damage)'
}

export interface SurveyData {
  id: string; // generated timestamp or uuid
  timestamp: string;
  memberType: MemberType;
  fullName: string;
  idCard: string;
  phone: string;
  address: string;
  area: string;
  damageLevel: DamageLevel;
  cause: string;
  waterLevel: string; // in cm or meters
  floodDuration: string;
  needs: string[]; // Array of selected needs
  otherNeeds?: string;
  damagedItems?: string; // New field for listing damaged items
  images: string[]; // Base64 strings or URLs
}

export interface ChartData {
  name: string;
  value: number;
}