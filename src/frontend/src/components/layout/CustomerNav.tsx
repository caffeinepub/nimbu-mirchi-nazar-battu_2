import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  RefreshCcw,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { useCart } from "../../hooks/useCart";

const navItems = [
  { to: "/products", label: "Products", Icon: ShoppingBag },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
  { to: "/subscriptions", label: "Subscribe", Icon: RefreshCcw },
  { to: "/account", label: "Account", Icon: User },
] as const;

export function CustomerNav() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {navItems.map(({ to, label, Icon }) => {
          const isActive = pathname.startsWith(to);
          const isCart = to === "/cart";
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors relative
                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
