import type { User, CartItem, Order, IncidentReport, ChatMessage, ChatChannel } from "./types";
import { LEVELS } from "./types";

// Storage keys
const KEYS = {
  USER: "stappdium-user",
  CART: "stappdium-cart",
  ORDERS: "stappdium-orders",
  REPORTS: "stappdium-reports",
  CHAT: (channel: ChatChannel) => `stappdium-chat-${channel}`,
  REDEEMED: "stappdium-redeemed",
} as const;

// Helper to safely access localStorage
const safeStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
};

// Custom events
export const emitEvent = (eventName: string, detail?: unknown) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

// User functions
export const getUser = (): User | null => safeStorage.get<User | null>(KEYS.USER, null);

export const setUser = (user: User): void => {
  safeStorage.set(KEYS.USER, user);
  emitEvent("user-updated", user);
};

export const isLoggedIn = (): boolean => getUser() !== null;

export const logout = (): void => {
  safeStorage.remove(KEYS.USER);
  emitEvent("user-updated", null);
};

export const createUser = (fanId: string, name: string, phone: string, email: string): User => {
  const user: User = {
    fanId,
    name,
    phone,
    email,
    registeredAt: new Date().toISOString(),
    points: 25, // Welcome bonus
    level: 0,
    ordersCount: 0,
    reportsCount: 0,
    messagesCount: 0,
    badges: [],
  };
  setUser(user);
  return user;
};

export const createDemoUser = (): User => {
  const user: User = {
    fanId: "DEMO123456",
    name: "Usuario Demo",
    phone: "5512345678",
    email: "demo@stappdium.app",
    registeredAt: new Date().toISOString(),
    points: 75,
    level: 1,
    ordersCount: 2,
    reportsCount: 0,
    messagesCount: 5,
    badges: ["primer_pedido"],
  };
  setUser(user);
  return user;
};

export const getUserLevel = (points: number): { level: number; name: string; color: string; nextLevel: typeof LEVELS[number] | null; progress: number } => {
  let currentLevel = LEVELS[0];
  let nextLevel: typeof LEVELS[number] | null = LEVELS[1];
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }
  
  const levelIndex = LEVELS.indexOf(currentLevel);
  let progress = 100;
  
  if (nextLevel) {
    const pointsInLevel = points - currentLevel.minPoints;
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
    progress = Math.min(100, (pointsInLevel / pointsNeeded) * 100);
  }
  
  return { level: levelIndex, name: currentLevel.name, color: currentLevel.color, nextLevel, progress };
};

export const addPoints = (amount: number, reason?: string): void => {
  const user = getUser();
  if (!user) return;
  
  user.points += amount;
  const levelInfo = getUserLevel(user.points);
  user.level = levelInfo.level;
  
  // Check for VIP badge
  if (levelInfo.level >= 5 && !user.badges.includes("vip")) {
    user.badges.push("vip");
  }
  
  setUser(user);
  emitEvent("points-earned", { amount, reason });
};

// Cart functions
export const getCart = (): CartItem[] => safeStorage.get<CartItem[]>(KEYS.CART, []);

export const setCart = (cart: CartItem[]): void => {
  safeStorage.set(KEYS.CART, cart);
  emitEvent("cart-updated", cart);
};

export const addToCart = (item: CartItem["item"]): void => {
  const cart = getCart();
  const existing = cart.find((c) => c.item.id === item.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item, quantity: 1 });
  }
  
  setCart(cart);
};

export const updateCartQuantity = (itemId: string, quantity: number): void => {
  let cart = getCart();
  
  if (quantity <= 0) {
    cart = cart.filter((c) => c.item.id !== itemId);
  } else {
    const item = cart.find((c) => c.item.id === itemId);
    if (item) item.quantity = quantity;
  }
  
  setCart(cart);
};

export const clearCart = (): void => setCart([]);

export const getCartTotal = (): number => {
  return getCart().reduce((total, item) => total + item.item.price * item.quantity, 0);
};

// Orders functions
export const getOrders = (): Order[] => safeStorage.get<Order[]>(KEYS.ORDERS, []);

export const setOrders = (orders: Order[]): void => {
  safeStorage.set(KEYS.ORDERS, orders);
  emitEvent("orders-updated", orders);
};

export const addOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  
  // Update user stats
  const user = getUser();
  if (user) {
    user.ordersCount += 1;
    if (!user.badges.includes("primer_pedido")) {
      user.badges.push("primer_pedido");
    }
    setUser(user);
  }
  
  // Add points
  addPoints(10, "Pedido realizado");
};

export const updateOrderStatus = (orderId: string, status: Order["status"]): void => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    setOrders(orders);
  }
};

export const generateOrderNumber = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SP-${num}`;
};

export const generateValidationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Reports functions
export const getReports = (): IncidentReport[] => safeStorage.get<IncidentReport[]>(KEYS.REPORTS, []);

export const addReport = (report: IncidentReport): void => {
  const reports = getReports();
  reports.unshift(report);
  safeStorage.set(KEYS.REPORTS, reports);
  emitEvent("reports-updated", reports);
  
  // Update user stats
  const user = getUser();
  if (user) {
    user.reportsCount += 1;
    if (!user.badges.includes("guardian") && user.reportsCount === 1) {
      user.badges.push("guardian");
      addPoints(50, "Primer reporte de seguridad");
    } else {
      addPoints(25, "Reporte de seguridad");
    }
    setUser(user);
  }
};

// Chat functions
export const getChatMessages = (channel: ChatChannel): ChatMessage[] => {
  return safeStorage.get<ChatMessage[]>(KEYS.CHAT(channel), []);
};

export const addChatMessage = (channel: ChatChannel, message: ChatMessage): void => {
  const messages = getChatMessages(channel);
  messages.push(message);
  safeStorage.set(KEYS.CHAT(channel), messages);
  emitEvent("chat-message", { channel, message });
  
  // Update user stats and check for points
  const user = getUser();
  if (user) {
    user.messagesCount += 1;
    
    // Check for social badge
    if (user.messagesCount >= 50 && !user.badges.includes("social")) {
      user.badges.push("social");
    }
    
    // Award points every 10 messages
    if (user.messagesCount % 10 === 0) {
      addPoints(2, "Participación en chat");
    }
    
    setUser(user);
  }
};

// Rewards functions
export const getRedeemedRewards = (): string[] => safeStorage.get<string[]>(KEYS.REDEEMED, []);

export const redeemReward = (rewardId: string, cost: number): boolean => {
  const user = getUser();
  if (!user || user.points < cost) return false;
  
  const redeemed = getRedeemedRewards();
  if (redeemed.includes(rewardId)) return false;
  
  user.points -= cost;
  redeemed.push(rewardId);
  
  setUser(user);
  safeStorage.set(KEYS.REDEEMED, redeemed);
  
  return true;
};
