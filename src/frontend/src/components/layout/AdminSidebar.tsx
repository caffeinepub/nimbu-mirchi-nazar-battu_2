import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  CreditCard,
  FileEdit,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCcw,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", Icon: Users },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/subscriptions", label: "Subscriptions", Icon: RefreshCcw },
  { to: "/admin/payments", label: "Payments", Icon: CreditCard },
  { to: "/admin/cms", label: "CMS", Icon: FileEdit },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { clear } = useInternetIdentity();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white font-bold text-sm">
            ✦
          </div>
          <div>
            <p className="text-sidebar-foreground font-display font-bold text-sm leading-tight">
              Nimbu Mirchi
            </p>
            <p className="text-sidebar-foreground/60 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, Icon }) => {
            const isActive = pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                    ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={clear}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  const closeMobile = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar flex items-center px-4 gap-3 border-b border-sidebar-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sidebar-foreground font-display font-bold text-sm">
          Nimbu Mirchi Admin
        </span>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 w-full h-full cursor-default"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
              <span className="text-sidebar-foreground font-display font-bold">
                Menu
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground"
                onClick={closeMobile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-sidebar flex-col fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
