"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, Plus, Check, Wifi, WifiOff, Minus, Trash2,
  CreditCard, Banknote, Loader2, ChevronRight
} from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { 
  isLoggedIn, getUser, getCart, addToCart, updateCartQuantity, 
  clearCart, getCartTotal, addOrder, generateOrderNumber, generateValidationCode 
} from "@/lib/storage";
import { FOOD_ITEMS, PICKUP_WINDOWS, MATCHES } from "@/lib/data";
import type { FoodItem, CartItem, PickupWindow, Order } from "@/lib/types";
import { toast } from "sonner";

type ViewState = "menu" | "confirmed";

const CATEGORIES = [
  { id: "burger", label: "Burgers", emoji: "🍔" },
  { id: "drinks", label: "Bebidas", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🍿" },
  { id: "mexican", label: "Mexicana", emoji: "🌮" },
  { id: "dessert", label: "Postres", emoji: "🍦" },
] as const;

export default function FoodPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("menu");
  const [category, setCategory] = useState<string>("burger");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Checkout form
  const [fanName, setFanName] = useState("");
  const [seat, setSeat] = useState("");
  const [pickupWindow, setPickupWindow] = useState<PickupWindow>("halftime");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [submitting, setSubmitting] = useState(false);
  
  // Confirmed order
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    
    const user = getUser();
    if (user) {
      setFanName(user.name);
    }
    setCart(getCart());
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleCartUpdate = () => setCart(getCart());
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("cart-updated", handleCartUpdate);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [router]);

  if (!mounted) return null;

  const filteredItems = FOOD_ITEMS.filter(item => item.category === category);
  const cartTotal = getCartTotal();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddItem = (item: FoodItem) => {
    addToCart(item);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1000);
    toast.success(`${item.name} agregado`);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const cartItem = cart.find(c => c.item.id === itemId);
    if (cartItem) {
      updateCartQuantity(itemId, cartItem.quantity + delta);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    updateCartQuantity(itemId, 0);
  };

  const handleCheckout = async () => {
    if (!fanName.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }
    if (!seat.trim()) {
      toast.error("Ingresa tu asiento");
      return;
    }
    
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      matchId: MATCHES[0].id,
      matchLabel: `${MATCHES[0].team1.flag} ${MATCHES[0].team1.code} vs ${MATCHES[0].team2.code} ${MATCHES[0].team2.flag}`,
      fanName,
      seat,
      pickupWindow,
      items: cart,
      total: cartTotal,
      status: "queued",
      syncStatus: isOnline ? "synced" : "pending",
      createdAt: new Date().toISOString(),
      standName: cart[0]?.item.standName || "Varios",
      paymentMethod,
      validationCode: generateValidationCode(),
    };
    
    addOrder(order);
    clearCart();
    setConfirmedOrder(order);
    setViewState("confirmed");
    setSheetOpen(false);
    setSubmitting(false);
    toast.success("Pedido confirmado!");
  };

  if (viewState === "confirmed" && confirmedOrder) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl p-4">
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold">{"¡Pedido confirmado!"}</h1>
            <p className="mt-1 text-muted-foreground">
              Tu pedido llegará a {confirmedOrder.seat}
            </p>
            
            {/* Validation Code */}
            <Card className="mt-6 w-full bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium opacity-80">Código de validación</p>
                <p className="mt-2 font-mono text-5xl font-black tracking-widest">
                  {confirmedOrder.validationCode}
                </p>
                <p className="mt-3 text-xs opacity-70">
                  El repartidor te mostrará este código para confirmar la entrega
                </p>
              </CardContent>
            </Card>
            
            {/* QR Code */}
            <Card className="mt-4 w-full">
              <CardContent className="flex flex-col items-center p-6">
                <p className="mb-4 text-sm font-medium">QR alternativo</p>
                <div className="rounded-lg bg-white p-4">
                  <QRCode
                    value={JSON.stringify({
                      code: confirmedOrder.validationCode,
                      seat: confirmedOrder.seat,
                      fan: confirmedOrder.fanName,
                      order: confirmedOrder.orderNumber,
                    })}
                    size={140}
                    fgColor="#006B3C"
                  />
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  Funciona sin internet {"📴"}
                </p>
              </CardContent>
            </Card>
            
            {/* Payment Info */}
            <Card className="mt-4 w-full">
              <CardContent className="flex items-center gap-3 p-4">
                {paymentMethod === "card" ? (
                  <CreditCard className="h-5 w-5 text-primary" />
                ) : (
                  <Banknote className="h-5 w-5 text-green-600" />
                )}
                <span className="text-sm">
                  {paymentMethod === "card" ? "Pago con tarjeta" : "Pago en efectivo al repartidor"}
                </span>
              </CardContent>
            </Card>
            
            <Badge className="mt-4 bg-primary/10 text-primary">
              +10 puntos acreditados
            </Badge>
            
            <div className="mt-6 flex w-full gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setViewState("menu");
                  setConfirmedOrder(null);
                }}
              >
                Ver más opciones
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push("/orders")}
              >
                Mis pedidos
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold">Pedir Comida</h1>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                  <Wifi className="h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
                  <WifiOff className="h-3 w-3" />
                  Sin conexión
                </Badge>
              )}
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="mx-auto max-w-2xl px-4 pb-3">
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {CATEGORIES.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-1">
                    <span>{cat.emoji}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="mx-auto max-w-2xl space-y-3 p-4 pb-32">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    {item.popular && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold text-primary">${item.price}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.prepTime} min
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full transition-all",
                    addedItemId === item.id && "bg-green-500 hover:bg-green-500"
                  )}
                  onClick={() => handleAddItem(item)}
                  disabled={!item.available}
                >
                  {addedItemId === item.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
            <div className="mx-auto max-w-2xl">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="h-14 w-full justify-between rounded-2xl shadow-lg" size="lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      <span>Mi pedido</span>
                      <Badge className="bg-white text-primary">{cartCount}</Badge>
                    </div>
                    <span className="font-bold">${cartTotal}</span>
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
                  <SheetHeader>
                    <SheetTitle>Tu pedido</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-4 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {/* Cart Items */}
                      <div className="space-y-3">
                        {cart.map(cartItem => (
                          <div key={cartItem.item.id} className="flex items-center gap-3">
                            <span className="text-2xl">{cartItem.item.emoji}</span>
                            <div className="flex-1">
                              <p className="font-medium">{cartItem.item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${cartItem.item.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(cartItem.item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-6 text-center font-medium">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(cartItem.item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveItem(cartItem.item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      {/* Checkout Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Tu nombre</Label>
                            <Input
                              value={fanName}
                              onChange={e => setFanName(e.target.value)}
                              placeholder="Nombre"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Asiento</Label>
                            <Input
                              value={seat}
                              onChange={e => setSeat(e.target.value)}
                              placeholder="Ej: Norte A-15"
                            />
                          </div>
                        </div>
                        
                        {/* Pickup Window */}
                        <div className="space-y-2">
                          <Label>Ventana de retiro</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {PICKUP_WINDOWS.map(window => (
                              <button
                                key={window.id}
                                onClick={() => setPickupWindow(window.id)}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                                  pickupWindow === window.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <span>{window.emoji}</span>
                                <span>{window.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Payment Method */}
                        <div className="space-y-2">
                          <Label>Método de pago</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setPaymentMethod("card")}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                                paymentMethod === "card"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Tarjeta</span>
                            </button>
                            <button
                              onClick={() => setPaymentMethod("cash")}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                                paymentMethod === "cash"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <Banknote className="h-4 w-4" />
                              <span>Efectivo</span>
                            </button>
                          </div>
                          {paymentMethod === "cash" && (
                            <p className="text-xs text-muted-foreground">
                              Paga al repartidor cuando llegue a tu asiento
                            </p>
                          )}
                        </div>
                        
                        <Card className="bg-muted/50">
                          <CardContent className="p-3 text-xs text-muted-foreground">
                            <p>
                              {"🔒"} Se generará un código de 4 dígitos. El repartidor te lo mostrará para confirmar.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Checkout Button */}
                    <div className="border-t pt-4 mt-4 pb-8">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Total</span>
                        <span className="text-xl font-bold">${cartTotal}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleCheckout}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            Confirmar pedido • ${cartTotal}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
