import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { AdminLayout } from "./components/layout/AdminLayout";
// Layouts
import { CustomerLayout } from "./components/layout/CustomerLayout";

import { AdminLoginPage } from "./pages/public/AdminLoginPage";
// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { LegalPage } from "./pages/public/LegalPage";
import { LoginPage } from "./pages/public/LoginPage";

import { AccountPage } from "./pages/customer/AccountPage";
import { CartPage } from "./pages/customer/CartPage";
import { OrdersPage } from "./pages/customer/OrdersPage";
// Customer Pages
import { ProductsPage } from "./pages/customer/ProductsPage";
import { SubscriptionsPage } from "./pages/customer/SubscriptionsPage";

import { CMSPage } from "./pages/admin/CMSPage";
import { CustomersPage } from "./pages/admin/CustomersPage";
// Admin Pages
import { DashboardPage } from "./pages/admin/DashboardPage";
import { OrdersAdminPage } from "./pages/admin/OrdersAdminPage";
import { PaymentsPage } from "./pages/admin/PaymentsPage";
import { ProductsAdminPage } from "./pages/admin/ProductsAdminPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { SubscriptionsAdminPage } from "./pages/admin/SubscriptionsAdminPage";

// ── Root Route ────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  ),
});

// ── Public Routes ─────────────────────────────────────────────────────────────

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const legalTermsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/terms",
  component: () => <LegalPage type="terms" />,
});

const legalPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/privacy",
  component: () => <LegalPage type="privacy" />,
});

const legalRefundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/refund",
  component: () => <LegalPage type="refund" />,
});

const legalShippingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/shipping",
  component: () => <LegalPage type="shipping" />,
});

// ── Customer Layout Routes ────────────────────────────────────────────────────

const customerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "customer-layout",
  component: CustomerLayout,
});

const productsRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/products",
  component: ProductsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/cart",
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/orders",
  component: OrdersPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/subscriptions",
  component: SubscriptionsPage,
});

const accountRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/account",
  component: AccountPage,
});

// ── Admin Layout Routes ───────────────────────────────────────────────────────

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/customers",
  component: CustomersPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/products",
  component: ProductsAdminPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: OrdersAdminPage,
});

const adminSubscriptionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/subscriptions",
  component: SubscriptionsAdminPage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/payments",
  component: PaymentsPage,
});

const adminCMSRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/cms",
  component: CMSPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  adminLoginRoute,
  legalTermsRoute,
  legalPrivacyRoute,
  legalRefundRoute,
  legalShippingRoute,
  customerLayoutRoute.addChildren([
    productsRoute,
    cartRoute,
    ordersRoute,
    subscriptionsRoute,
    accountRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminCustomersRoute,
    adminProductsRoute,
    adminOrdersRoute,
    adminSubscriptionsRoute,
    adminPaymentsRoute,
    adminCMSRoute,
    adminSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
