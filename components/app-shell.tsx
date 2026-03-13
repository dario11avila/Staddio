"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Map, UtensilsCrossed, MessageCircle, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/storage";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/food", label: "Comida", icon: UtensilsCrossed },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/rewards", label: "Puntos", icon: Gift },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
    };

    updateCartCount();

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="min-h-screen flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-20">
        {children}
      </main>

      {/* Menú inferior: siempre visible en mobile, responsivo en desktop */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:bg-background/98"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-around gap-0 px-2 sm:px-4 md:px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/food" && cartCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-colors sm:gap-1 sm:py-2.5 sm:text-xs",
                  "min-h-[44px] min-w-[44px] sm:min-w-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:bg-muted/50"
                )}
              >
                <div className="relative shrink-0">
                  <Icon
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6",
                      isActive && "text-primary"
                    )}
                    aria-hidden
                  />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-full">{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 h-0.5 w-6 rounded-full bg-primary sm:w-8"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
