import type { Match, FoodStand, FoodItem, Reward, Badge, ChatChannel } from "./types";

export const MATCHES: Match[] = [
  {
    id: "match-1",
    team1: { name: "México", flag: "🇲🇽", code: "MEX" },
    team2: { name: "Argentina", flag: "🇦🇷", code: "ARG" },
    date: "2026-06-14",
    time: "19:00",
    stadium: "Estadio Akron",
    city: "Guadalajara",
    group: "Grupo A",
  },
  {
    id: "match-2",
    team1: { name: "Brasil", flag: "🇧🇷", code: "BRA" },
    team2: { name: "USA", flag: "🇺🇸", code: "USA" },
    date: "2026-06-17",
    time: "17:00",
    stadium: "Estadio Azteca",
    city: "CDMX",
    group: "Grupo B",
  },
  {
    id: "match-3",
    team1: { name: "España", flag: "🇪🇸", code: "ESP" },
    team2: { name: "Francia", flag: "🇫🇷", code: "FRA" },
    date: "2026-06-20",
    time: "20:00",
    stadium: "Estadio BBVA",
    city: "Monterrey",
    group: "Grupo C",
  },
  {
    id: "match-4",
    team1: { name: "Alemania", flag: "🇩🇪", code: "GER" },
    team2: { name: "Portugal", flag: "🇵🇹", code: "POR" },
    date: "2026-06-23",
    time: "19:00",
    stadium: "Estadio Akron",
    city: "Guadalajara",
    group: "Grupo D",
  },
];

export const FOOD_STANDS: FoodStand[] = [
  { id: "stand-1", name: "Burger Zone", emoji: "🍔", location: "Nivel 1, Puertas A-C", level: 1 },
  { id: "stand-2", name: "Taquería del Estadio", emoji: "🌮", location: "Nivel 1, Puerta D", level: 1 },
  { id: "stand-3", name: "Snack Corner", emoji: "🍿", location: "Nivel 2, Pasillo Central", level: 2 },
  { id: "stand-4", name: "Bebidas & Más", emoji: "🥤", location: "Todos los niveles", level: 0 },
  { id: "stand-5", name: "Dulcería FIFA", emoji: "🍦", location: "Nivel 2, Puerta E", level: 2 },
];

export const FOOD_ITEMS: FoodItem[] = [
  // Burgers
  { id: "item-1", standId: "stand-1", standName: "Burger Zone", name: "Hamburguesa Clásica", description: "Carne de res 150g, lechuga, tomate, cebolla y salsa especial", price: 180, category: "burger", emoji: "🍔", available: true, prepTime: 8, popular: true },
  { id: "item-2", standId: "stand-1", standName: "Burger Zone", name: "Double Bacon Burger", description: "Doble carne, tocino crujiente, queso cheddar y jalapeños", price: 240, category: "burger", emoji: "🥩", available: true, prepTime: 10, popular: true },
  { id: "item-3", standId: "stand-1", standName: "Burger Zone", name: "Veggie Burger", description: "Hamburguesa vegetariana con aguacate y chipotle", price: 175, category: "burger", emoji: "🥗", available: true, prepTime: 8 },
  
  // Snacks
  { id: "item-4", standId: "stand-3", standName: "Snack Corner", name: "Hot Dog Gourmet", description: "Salchicha premium con toppings a elegir", price: 130, category: "snacks", emoji: "🌭", available: true, prepTime: 5 },
  { id: "item-5", standId: "stand-3", standName: "Snack Corner", name: "Nachos con Queso", description: "Totopos crujientes con queso fundido y jalapeños", price: 120, category: "snacks", emoji: "🧀", available: true, prepTime: 4 },
  { id: "item-6", standId: "stand-3", standName: "Snack Corner", name: "Palomitas Grandes", description: "Palomitas recién hechas con mantequilla", price: 95, category: "snacks", emoji: "🍿", available: true, prepTime: 2, popular: true },
  { id: "item-7", standId: "stand-3", standName: "Snack Corner", name: "Papas Fritas", description: "Papas fritas crujientes con sal", price: 90, category: "snacks", emoji: "🍟", available: true, prepTime: 5 },
  { id: "item-8", standId: "stand-3", standName: "Snack Corner", name: "Alitas BBQ 6pzs", description: "Alitas de pollo bañadas en salsa BBQ", price: 200, category: "snacks", emoji: "🍗", available: true, prepTime: 12 },
  { id: "item-9", standId: "stand-3", standName: "Snack Corner", name: "Elote Preparado", description: "Elote con mayonesa, queso y chile", price: 80, category: "snacks", emoji: "🌽", available: true, prepTime: 3 },
  
  // Mexican
  { id: "item-10", standId: "stand-2", standName: "Taquería del Estadio", name: "Tacos 3pzs", description: "Tacos de pastor, bistec o carnitas", price: 150, category: "mexican", emoji: "🌮", available: true, prepTime: 6, popular: true },
  { id: "item-11", standId: "stand-2", standName: "Taquería del Estadio", name: "Quesadilla", description: "Tortilla de harina con queso y carne al gusto", price: 110, category: "mexican", emoji: "🫓", available: true, prepTime: 5 },
  
  // Drinks
  { id: "item-12", standId: "stand-4", standName: "Bebidas & Más", name: "Refresco Grande", description: "Refresco de cola, naranja o limón 600ml", price: 70, category: "drinks", emoji: "🥤", available: true, prepTime: 1 },
  { id: "item-13", standId: "stand-4", standName: "Bebidas & Más", name: "Agua Mineral", description: "Agua mineral natural 500ml", price: 50, category: "drinks", emoji: "💧", available: true, prepTime: 1 },
  { id: "item-14", standId: "stand-4", standName: "Bebidas & Más", name: "Cerveza Nacional", description: "Cerveza mexicana fría 355ml", price: 120, category: "drinks", emoji: "🍺", available: true, prepTime: 1, popular: true },
  { id: "item-15", standId: "stand-4", standName: "Bebidas & Más", name: "Michelada", description: "Cerveza preparada con limón y chamoy", price: 145, category: "drinks", emoji: "🍻", available: true, prepTime: 3 },
  
  // Desserts
  { id: "item-16", standId: "stand-5", standName: "Dulcería FIFA", name: "Helado de Copa", description: "Helado de vainilla, chocolate o fresa", price: 85, category: "dessert", emoji: "🍦", available: true, prepTime: 2 },
  { id: "item-17", standId: "stand-5", standName: "Dulcería FIFA", name: "Churros con Chocolate 3pzs", description: "Churros calientes con chocolate para dip", price: 100, category: "dessert", emoji: "🍩", available: true, prepTime: 5 },
];

export const REWARDS: Reward[] = [
  { id: "reward-1", emoji: "💧", name: "Agua gratis", description: "Canjea por un agua mineral en cualquier puesto", cost: 50 },
  { id: "reward-2", emoji: "🍿", name: "Snack gratis", description: "Palomitas o papas fritas gratis", cost: 100 },
  { id: "reward-3", emoji: "🍔", name: "20% desc. en comida", description: "Descuento en tu próximo pedido de comida", cost: 200 },
  { id: "reward-4", emoji: "🎽", name: "Mercancía oficial FIFA", description: "Playera o gorra oficial del Mundial", cost: 300 },
  { id: "reward-5", emoji: "👑", name: "Acceso a Zona VIP", description: "Acceso exclusivo a zona VIP por un partido", cost: 500 },
];

export const BADGES: Badge[] = [
  { id: "primer_pedido", emoji: "🍔", name: "Primer Pedido", description: "Hiciste tu primer pedido en el estadio" },
  { id: "guardian", emoji: "🛡️", name: "Guardián del Estadio", description: "Reportaste tu primer incidente de seguridad" },
  { id: "social", emoji: "💬", name: "Fan Social", description: "Enviaste más de 50 mensajes en el chat" },
  { id: "streak", emoji: "🔥", name: "En Racha", description: "3 pedidos en un solo partido" },
  { id: "vip", emoji: "👑", name: "VIP", description: "Alcanzaste el nivel Stappdium Elite" },
];

export const CHAT_CHANNELS: { id: ChatChannel; name: string; emoji: string; description: string }[] = [
  { id: "general", name: "General", emoji: "💬", description: "Conversación general del estadio" },
  { id: "entradas", name: "Entradas", emoji: "🎫", description: "Info sobre accesos y boletos" },
  { id: "estacionamiento", name: "Estacionamiento", emoji: "🚗", description: "Estado del estacionamiento" },
  { id: "seguridad", name: "Seguridad", emoji: "🛡️", description: "Avisos de seguridad" },
  { id: "comida", name: "Comida", emoji: "🍔", description: "Tips de comida y filas" },
  { id: "ambiente", name: "Ambiente", emoji: "🎉", description: "Ambiente y porras del partido" },
];

export const PICKUP_WINDOWS = [
  { id: "before_game" as const, label: "Antes del partido", emoji: "⏰" },
  { id: "halftime" as const, label: "En el descanso", emoji: "⏸️" },
  { id: "second_half" as const, label: "Segundo tiempo", emoji: "▶️" },
  { id: "after_game" as const, label: "Al finalizar", emoji: "🏁" },
];

export const INCIDENT_TYPES = [
  { id: "violence" as const, label: "Violencia", emoji: "🤛", priority: "high" as const },
  { id: "theft" as const, label: "Robo", emoji: "🦹", priority: "high" as const },
  { id: "medical" as const, label: "Emergencia médica", emoji: "🏥", priority: "high" as const },
  { id: "suspicious" as const, label: "Objeto sospechoso", emoji: "👁️", priority: "medium" as const },
  { id: "harassment" as const, label: "Acoso", emoji: "😤", priority: "high" as const },
  { id: "fire" as const, label: "Incendio", emoji: "🔥", priority: "high" as const },
  { id: "other" as const, label: "Otro", emoji: "❓", priority: "low" as const },
];

export const STADIUM_SECTORS = [
  "Norte A - Fila 1-10",
  "Norte A - Fila 11-20",
  "Norte B - Fila 1-10",
  "Norte B - Fila 11-20",
  "Sur A - Fila 1-10",
  "Sur A - Fila 11-20",
  "Sur B - Fila 1-10",
  "Sur B - Fila 11-20",
  "Este A",
  "Este B",
  "Oeste A",
  "Oeste B",
  "Palcos VIP Norte",
  "Palcos VIP Sur",
  "Zona de Prensa",
  "Accesos y Pasillos",
];

export const DEMO_CHAT_MESSAGES: Record<ChatChannel, { userName: string; fanId: string; text: string; isOfficial?: boolean }[]> = {
  general: [
    { userName: "Carlos M.", fanId: "FAN123", text: "¡Vamos México! 🇲🇽" },
    { userName: "Staff Oficial", fanId: "STAFF001", text: "Bienvenidos al Estadio Akron. Disfruten el partido.", isOfficial: true },
    { userName: "Ana R.", fanId: "FAN456", text: "¿Alguien sabe a qué hora abren las puertas?" },
  ],
  entradas: [
    { userName: "Staff Oficial", fanId: "STAFF001", text: "Las puertas abren 2 horas antes del partido.", isOfficial: true },
    { userName: "Roberto L.", fanId: "FAN789", text: "Por la puerta Norte hay menos fila" },
  ],
  estacionamiento: [
    { userName: "Luis G.", fanId: "FAN321", text: "El estacionamiento 3 ya está lleno" },
    { userName: "María P.", fanId: "FAN654", text: "Encontré lugar en el nivel 2, zona B" },
  ],
  seguridad: [
    { userName: "Staff Oficial", fanId: "STAFF001", text: "Recuerden no traer objetos prohibidos.", isOfficial: true },
    { userName: "Pedro S.", fanId: "FAN987", text: "La revisión en puerta A está rápida" },
  ],
  comida: [
    { userName: "Jorge H.", fanId: "FAN147", text: "Los tacos del nivel 1 están increíbles 🌮" },
    { userName: "Sofia M.", fanId: "FAN258", text: "En Burger Zone hay poca fila ahora" },
  ],
  ambiente: [
    { userName: "Diego R.", fanId: "FAN369", text: "¡La porra está increíble! 🎉" },
    { userName: "Laura V.", fanId: "FAN741", text: "¡Goooool! 🎊" },
  ],
};
