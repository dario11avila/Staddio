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
      <main className="flex-1 pb-20">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/food" && cartCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-2 h-1 w-8 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
