import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProductInput {
    name: string;
    description: string;
    isActive: boolean;
    stock: bigint;
    category: ProductCategory;
    image: ExternalBlob;
    price: bigint;
}
export interface User {
    principal: Principal;
    isBlocked: boolean;
    name: string;
    createdAt: bigint;
    role: UserRole;
    phone: string;
}
export interface OrderItem {
    qty: bigint;
    productId: bigint;
    price: bigint;
}
export interface CMSTerms {
    refundPolicy: string;
    privacyPolicy: string;
    shippingPolicy: string;
    termsAndConditions: string;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    userId: Principal;
    createdAt: bigint;
    deliveryDate: bigint;
    addressLine: string;
    items: Array<OrderItem>;
    pincode: string;
}
export interface DashboardStats {
    totalOrders: bigint;
    subscriptionRevenue: bigint;
    dailyRevenue: bigint;
    weeklyRevenue: bigint;
    monthlyRevenue: bigint;
}
export interface Subscription {
    id: bigint;
    qty: bigint;
    isCancelled: boolean;
    userId: Principal;
    isPaused: boolean;
    createdAt: bigint;
    productId: bigint;
    addressLine: string;
    orderIds: Array<bigint>;
    phone: string;
    pincode: string;
}
export interface DeliverySettings {
    minOrderValue: bigint;
    allowedPincodes: Array<string>;
    isOrderFreezeActive: boolean;
}
export interface CMSTagline {
    tagline: string;
    festivalOffer: string;
    popupActive: boolean;
    popupText: string;
}
export interface CMSSEO {
    seoTitle: string;
    seoMeta: string;
}
export interface CMSContent {
    seo: CMSSEO;
    terms: CMSTerms;
    tagline: CMSTagline;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    stock: bigint;
    category: ProductCategory;
    image: ExternalBlob;
    price: bigint;
}
export interface UserProfile {
    isBlocked: boolean;
    name: string;
    role: UserRole;
    phone: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid",
    delivered = "delivered",
    confirmed = "confirmed",
    awaitingPayment = "awaitingPayment"
}
export enum PaymentMethod {
    cod = "cod",
    paymentLink = "paymentLink"
}
export enum ProductCategory {
    car = "car",
    home = "home",
    shop = "shop"
}
export enum UserRole {
    admin = "admin",
    customer = "customer",
    superAdmin = "superAdmin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(productInput: ProductInput): Promise<Product>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    blockUser(userPrincipal: Principal): Promise<void>;
    cancelOrder(orderId: bigint): Promise<Order>;
    cancelSubscription(subscriptionId: bigint): Promise<Subscription>;
    /**
     * / Register caller as SUPER_ADMIN and admin - only works when no admin exists
     * / If caller already has a user entry, upgrades it to superAdmin (preserving createdAt)
     */
    claimFirstAdmin(name: string, phone: string): Promise<User>;
    createSubscription(productId: bigint, qty: bigint, addressLine: string, pincode: string, phone: string): Promise<Subscription>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<User>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getCMSContent(): Promise<CMSContent>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getDashboardStats(): Promise<DashboardStats>;
    getDeliverySettings(): Promise<DeliverySettings>;
    getMyOrders(): Promise<Array<Order>>;
    getMyProfile(): Promise<User>;
    getMySubscriptions(): Promise<Array<Subscription>>;
    getNextSaturday(): Promise<bigint>;
    getProduct(productId: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasNoAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markPaymentPaid(orderId: bigint): Promise<Order>;
    pauseSubscription(subscriptionId: bigint): Promise<Subscription>;
    placeOrder(items: Array<OrderItem>, deliveryDate: bigint, paymentMethod: PaymentMethod, addressLine: string, pincode: string): Promise<Order>;
    registerOrLogin(name: string, phone: string): Promise<User>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserRole(userPrincipal: Principal, newRole: UserRole): Promise<void>;
    unblockUser(userPrincipal: Principal): Promise<void>;
    updateCMSContent(tagline: CMSTagline, terms: CMSTerms, seo: CMSSEO): Promise<void>;
    updateDeliverySettings(settings: DeliverySettings): Promise<void>;
    updateMyProfile(name: string, phone: string): Promise<User>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<Order>;
    updateProduct(productId: bigint, productInput: ProductInput): Promise<Product>;
}
