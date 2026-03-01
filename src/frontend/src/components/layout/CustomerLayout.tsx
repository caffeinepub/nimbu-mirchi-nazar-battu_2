import { Outlet } from "@tanstack/react-router";
import { CustomerNav } from "./CustomerNav";

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding for nav */}
      <main className="pb-20">
        <Outlet />
      </main>
      <CustomerNav />
    </div>
  );
}
