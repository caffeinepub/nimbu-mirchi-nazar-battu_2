import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  CMSSEO,
  CMSTagline,
  CMSTerms,
  DeliverySettings,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ProductCategory,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Products ──────────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(productId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["product", productId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (input: any) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return actor.addProduct(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      input,
    }: {
      productId: bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: any;
    }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return actor.updateProduct(productId, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      deliveryDate,
      paymentMethod,
      addressLine,
      pincode,
    }: {
      items: OrderItem[];
      deliveryDate: bigint;
      paymentMethod: PaymentMethod;
      addressLine: string;
      pincode: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        items,
        deliveryDate,
        paymentMethod,
        addressLine,
        pincode,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-orders"] }),
  });
}

export function useMarkPaymentPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markPaymentPaid(orderId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-orders"] }),
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      qc.invalidateQueries({ queryKey: ["all-orders"] });
    },
  });
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export function useMySubscriptions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySubscriptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSubscriptions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-subscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubscription() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      qty,
      addressLine,
      pincode,
      phone,
    }: {
      productId: bigint;
      qty: bigint;
      addressLine: string;
      pincode: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSubscription(
        productId,
        qty,
        addressLine,
        pincode,
        phone,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-subscriptions"] }),
  });
}

export function usePauseSubscription() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.pauseSubscription(subscriptionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
      qc.invalidateQueries({ queryKey: ["all-subscriptions"] });
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelSubscription(subscriptionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
      qc.invalidateQueries({ queryKey: ["all-subscriptions"] });
    },
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-customers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterOrLogin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerOrLogin(name, phone);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["is-admin"] });
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMyProfile(name, phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.blockUser(userPrincipal);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-customers"] }),
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unblockUser(userPrincipal);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-customers"] }),
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userPrincipal,
      newRole,
    }: {
      userPrincipal: Principal;
      newRole: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setUserRole(userPrincipal, newRole);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-customers"] }),
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── CMS ───────────────────────────────────────────────────────────────────────

export function useCMSContent() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["cms-content"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCMSContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCMSContent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tagline,
      terms,
      seo,
    }: {
      tagline: CMSTagline;
      terms: CMSTerms;
      seo: CMSSEO;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCMSContent(tagline, terms, seo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-content"] }),
  });
}

// ── Delivery Settings ─────────────────────────────────────────────────────────

export function useDeliverySettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDeliverySettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDeliverySettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: DeliverySettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDeliverySettings(settings);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-settings"] }),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNextSaturday() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["next-saturday"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNextSaturday();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Cart Store (Zustand) ──────────────────────────────────────────────────────

export type CartItem = {
  productId: bigint;
  name: string;
  price: bigint;
  qty: number;
  image: string;
  category: ProductCategory;
};

// Simple in-memory cart (we'll use zustand)
let cartItems: CartItem[] = [];
let cartListeners: (() => void)[] = [];

function notifyCart() {
  for (const l of cartListeners) l();
}

export const cartStore = {
  getItems: () => cartItems,
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => {
    const existing = cartItems.find((i) => i.productId === item.productId);
    if (existing) {
      cartItems = cartItems.map((i) =>
        i.productId === item.productId
          ? { ...i, qty: i.qty + (item.qty ?? 1) }
          : i,
      );
    } else {
      cartItems = [...cartItems, { ...item, qty: item.qty ?? 1 }];
    }
    notifyCart();
  },
  updateQty: (productId: bigint, qty: number) => {
    if (qty <= 0) {
      cartItems = cartItems.filter((i) => i.productId !== productId);
    } else {
      cartItems = cartItems.map((i) =>
        i.productId === productId ? { ...i, qty } : i,
      );
    }
    notifyCart();
  },
  removeItem: (productId: bigint) => {
    cartItems = cartItems.filter((i) => i.productId !== productId);
    notifyCart();
  },
  clear: () => {
    cartItems = [];
    notifyCart();
  },
  subscribe: (listener: () => void) => {
    cartListeners.push(listener);
    return () => {
      cartListeners = cartListeners.filter((l) => l !== listener);
    };
  },
};

export { ExternalBlob };
