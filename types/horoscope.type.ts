export type DailyHoroscope = {
  text: string;
  detailedText: string;
  love: string;
  career: string;
  health: string;
};

export interface Horoscope {
  sunSign: string;
  ascendantSign: string | null;
  moonSign: string;
  elementGroup: string;
}

export interface UserInformation {
  fullName: string;
  birthDate: string;
  birthTime: string;
  city: string;
  horoscope: Horoscope;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
}

export interface MoonPhase {
  phase: string;
  description: string;
  date: string;
}

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};
