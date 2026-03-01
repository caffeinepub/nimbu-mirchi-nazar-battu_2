import { Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      {/* Main content — offset for sidebar on desktop, top bar on mobile */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
