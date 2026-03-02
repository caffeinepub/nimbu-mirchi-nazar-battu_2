# Nimbu Mirchi Nazar Battu

## Current State
Full Saturday-delivery platform with customer panel (products, cart, orders, subscriptions) and admin panel (dashboard, orders, customers, products, subscriptions, payments, CMS, settings). Order placement navigates to /orders after success. Admin dashboard shows stats + weekly chart + recent orders. No order confirmation screen exists for customers post-purchase. No new-order notification/badge for admin.

## Requested Changes (Diff)

### Add
1. **Order Confirmation Screen (customer-facing):** After successful order placement in CartPage, instead of immediately navigating to /orders, show an in-page "Order Confirmed!" success screen with:
   - Large green checkmark / celebration icon
   - Order ID (returned from placeOrder mutation)
   - List of ordered items (name × qty)
   - Delivery date (next Saturday formatted as "Saturday, 8 March 2026")
   - Total amount
   - Payment method (COD or "Admin will share payment link")
   - Two buttons: "View My Orders" → /orders and "Continue Shopping" → /products
   - data-ocid: order_confirmation.success_state

2. **New Orders Badge on Admin Dashboard/Nav:** 
   - Track "last seen orders count" in localStorage (key: `nimbu_last_seen_orders`)
   - On admin dashboard load, compare current total orders count vs last-seen count
   - Show a red badge with count of new orders on the "Orders" nav link in AdminLayout sidebar
   - On visiting /admin/orders, update localStorage to current count (mark as seen)
   - Also show a "🔔 X new orders since your last visit" banner at top of DashboardPage if count > 0, with a "View Orders" button
   - data-ocid: admin_nav.orders_badge, dashboard.new_orders_banner

### Modify
- **CartPage:** After `placeOrder.mutateAsync` succeeds, capture the returned order data (id, items, total, delivery date, payment method), set a local state `confirmedOrder`, and render the confirmation screen instead of the toast+navigate pattern. Keep the cart cleared.
- **AdminLayout:** Read `nimbu_last_seen_orders` from localStorage and compare with `useAllOrders` count to show badge on Orders nav link.
- **OrdersAdminPage:** On mount/render, update localStorage `nimbu_last_seen_orders` to current orders count.
- **DashboardPage:** Show new-orders banner if unread count > 0.

### Remove
- The `toast.success(...)` + `navigate({ to: "/orders" })` after order placement (replaced by in-page confirmation screen).

## Implementation Plan
1. Modify CartPage to show in-page order confirmation screen after successful order placement (capture order result, render confirmation UI with order details, delivery date, items, payment method, two CTA buttons).
2. Add new-orders badge logic in AdminLayout -- read localStorage, compare with allOrders count, show red badge number on Orders nav link.
3. Update OrdersAdminPage to write current orders count to localStorage on render.
4. Add new-orders banner on DashboardPage -- show "X new orders" alert with View Orders button if unread count > 0.
