export type LeaderboardEntry = {
  rank: number;
  userAlias: string;
  city: string;
  ordersDriven: number;
  lifetimeCommission: number;
  lastMonthCommission: number;
};

export const leaderboardFixture: LeaderboardEntry[] = [
  { rank: 1, userAlias: "Hannah G.", city: "Belfast", ordersDriven: 42, lifetimeCommission: 780, lastMonthCommission: 190 },
  { rank: 2, userAlias: "Aria D.", city: "Derry", ordersDriven: 36, lifetimeCommission: 660, lastMonthCommission: 160 },
  { rank: 3, userAlias: "Connor T.", city: "Lisburn", ordersDriven: 30, lifetimeCommission: 540, lastMonthCommission: 150 },
  { rank: 4, userAlias: "Nova S.", city: "Bangor", ordersDriven: 24, lifetimeCommission: 420, lastMonthCommission: 120 },
  { rank: 5, userAlias: "Luca B.", city: "Newry", ordersDriven: 22, lifetimeCommission: 390, lastMonthCommission: 95 },
  { rank: 6, userAlias: "Maya R.", city: "Antrim", ordersDriven: 20, lifetimeCommission: 360, lastMonthCommission: 90 },
  { rank: 7, userAlias: "Elliot P.", city: "Armagh", ordersDriven: 18, lifetimeCommission: 330, lastMonthCommission: 85 },
  { rank: 8, userAlias: "Isla M.", city: "Omagh", ordersDriven: 16, lifetimeCommission: 300, lastMonthCommission: 78 },
  { rank: 9, userAlias: "Rory C.", city: "Coleraine", ordersDriven: 15, lifetimeCommission: 260, lastMonthCommission: 72 },
  { rank: 10, userAlias: "Zara W.", city: "Dungannon", ordersDriven: 13, lifetimeCommission: 230, lastMonthCommission: 65 },
  { rank: 11, userAlias: "Freya", city: "Belfast", ordersDriven: 11, lifetimeCommission: 210, lastMonthCommission: 60 },
  { rank: 12, userAlias: "Theo", city: "Belfast", ordersDriven: 10, lifetimeCommission: 195, lastMonthCommission: 55 },
  { rank: 13, userAlias: "Jasper", city: "Newcastle", ordersDriven: 9, lifetimeCommission: 180, lastMonthCommission: 52 },
  { rank: 14, userAlias: "Ivy", city: "Portrush", ordersDriven: 8, lifetimeCommission: 170, lastMonthCommission: 50 },
  { rank: 15, userAlias: "Miles", city: "Enniskillen", ordersDriven: 8, lifetimeCommission: 165, lastMonthCommission: 48 },
  { rank: 16, userAlias: "Ada", city: "Ballymena", ordersDriven: 7, lifetimeCommission: 150, lastMonthCommission: 42 },
  { rank: 17, userAlias: "Harper", city: "Belfast", ordersDriven: 6, lifetimeCommission: 140, lastMonthCommission: 40 },
  { rank: 18, userAlias: "Leo", city: "Bangor", ordersDriven: 6, lifetimeCommission: 130, lastMonthCommission: 38 },
  { rank: 19, userAlias: "Sienna", city: "Lisburn", ordersDriven: 5, lifetimeCommission: 120, lastMonthCommission: 34 },
  { rank: 20, userAlias: "Owen", city: "Newry", ordersDriven: 5, lifetimeCommission: 115, lastMonthCommission: 33 }
];
