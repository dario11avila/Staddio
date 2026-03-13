// User types
export interface User {
  fanId: string;
  name: string;
  phone: string;
  email: string;
  registeredAt: string;
  points: number;
  level: number;
  ordersCount: number;
  reportsCount: number;
  messagesCount: number;
  badges: string[];
}

export const LEVELS = [
  { name: "Rookie", minPoints: 0, color: "bg-gray-500" },
  { name: "Fan", minPoints: 50, color: "bg-blue-500" },
  { name: "Super Fan", minPoints: 150, color: "bg-green-500" },
  { name: "Ultra", minPoints: 300, color: "bg-purple-500" },
  { name: "Leyenda", minPoints: 500, color: "bg-orange-500" },
  { name: "Stappdium Elite", minPoints: 1000, color: "bg-yellow-500" },
] as const;

// Food types
export interface FoodItem {
  id: string;
  standId: string;
  standName: string;
  name: string;
  description: string;
  price: number;
  category: "burger" | "drinks" | "snacks" | "mexican" | "dessert";
  emoji: string;
  available: boolean;
  prepTime: number;
  popular?: boolean;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export type PickupWindow = "before_game" | "halftime" | "second_half" | "after_game";
export type OrderStatus = "queued" | "confirmed" | "preparing" | "ready" | "delivered";
export type SyncStatus = "synced" | "pending";

export interface Order {
  id: string;
  orderNumber: string;
  matchId: string;
  matchLabel: string;
  fanName: string;
  seat: string;
  pickupWindow: PickupWindow;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  syncStatus: SyncStatus;
  createdAt: string;
  standName: string;
  paymentMethod: "card" | "cash";
  validationCode: string;
}

// Incident types
export type IncidentType = "violence" | "theft" | "medical" | "suspicious" | "harassment" | "fire" | "other";
export type IncidentStatus = "sent" | "received" | "in_progress" | "resolved";

export interface IncidentReport {
  id: string;
  userId: string;
  userName: string;
  type: IncidentType;
  sector: string;
  description: string;
  anonymous: boolean;
  status: IncidentStatus;
  timestamp: string;
  securityUnit?: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  channel: string;
  userId: string;
  userName: string;
  fanId: string;
  text: string;
  timestamp: string;
  isOfficial?: boolean;
}

export type ChatChannel = "general" | "entradas" | "estacionamiento" | "seguridad" | "comida" | "ambiente";

// Match types
export interface Match {
  id: string;
  team1: { name: string; flag: string; code: string };
  team2: { name: string; flag: string; code: string };
  date: string;
  time: string;
  stadium: string;
  city: string;
  group: string;
}

// Stand types
export interface FoodStand {
  id: string;
  name: string;
  emoji: string;
  location: string;
  level: number;
}

// Reward types
export interface Reward {
  id: string;
  emoji: string;
  name: string;
  description: string;
  cost: number;
}

// Badge types
export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
}
