// store/billingStore.ts
// Zustand store for billing & subscription state.
// Uses mock data until a real backend is connected.
// Owned by: Lead (Billing module)

import { create } from "zustand";
import type { PlanId, BillingCycle, Invoice } from "@/lib/paymentConfig";

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "rupay";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface BillingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  gstNumber: string;
}

interface BillingState {
  // Subscription
  currentPlan: PlanId;
  billingCycle: BillingCycle;
  subscriptionStatus: "active" | "cancelled" | "past_due" | "trialing";
  renewalDate: string;

  // Payment methods
  paymentMethods: PaymentMethod[];

  // Billing info
  billingInfo: BillingInfo;

  // Invoices
  invoices: Invoice[];

  // Actions
  upgradePlan: (planId: PlanId, cycle: BillingCycle) => void;
  downgradePlan: (planId: PlanId) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  updateBillingInfo: (info: Partial<BillingInfo>) => void;
  cancelSubscription: () => void;
  reactivateSubscription: () => void;
}

// Mock data
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", type: "visa", last4: "4242", expiry: "12/27", isDefault: true },
  { id: "pm_2", type: "mastercard", last4: "8888", expiry: "06/26", isDefault: false },
];

const MOCK_INVOICES: Invoice[] = [
  { id: "INV-2026-006", date: "2026-06-01", amount: 799, plan: "Pro", status: "paid", pdfUrl: "#" },
  { id: "INV-2026-005", date: "2026-05-01", amount: 799, plan: "Pro", status: "paid", pdfUrl: "#" },
  { id: "INV-2026-004", date: "2026-04-01", amount: 799, plan: "Pro", status: "paid", pdfUrl: "#" },
  { id: "INV-2026-003", date: "2026-03-01", amount: 0, plan: "Free", status: "paid", pdfUrl: "#" },
  { id: "INV-2026-002", date: "2026-02-01", amount: 0, plan: "Free", status: "paid", pdfUrl: "#" },
];

function futureDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

export const useBillingStore = create<BillingState>((set) => ({
  // Initial mock state
  currentPlan: "free",
  billingCycle: "monthly",
  subscriptionStatus: "active",
  renewalDate: futureDate(1),
  paymentMethods: MOCK_PAYMENT_METHODS,
  billingInfo: {
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    gstNumber: "",
  },
  invoices: MOCK_INVOICES,

  upgradePlan: (planId, cycle) =>
    set((s) => ({
      currentPlan: planId,
      billingCycle: cycle,
      subscriptionStatus: "active",
      renewalDate: futureDate(cycle === "yearly" ? 12 : 1),
      invoices: [
        {
          id: `INV-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          amount: 0, // amount will be set by the caller
          plan: planId === "pro" ? "Pro" : planId === "promax" ? "Pro Max" : "Free",
          status: "paid" as const,
          pdfUrl: "#",
        },
        ...s.invoices,
      ],
    })),

  downgradePlan: (planId) =>
    set((s) => ({
      currentPlan: planId,
      subscriptionStatus: "active",
      renewalDate: futureDate(s.billingCycle === "yearly" ? 12 : 1),
    })),

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),

  addPaymentMethod: (method) =>
    set((s) => ({
      paymentMethods: [
        ...s.paymentMethods.map((m) =>
          method.isDefault ? { ...m, isDefault: false } : m
        ),
        { ...method, id: `pm_${Date.now()}` },
      ],
    })),

  removePaymentMethod: (id) =>
    set((s) => ({
      paymentMethods: s.paymentMethods.filter((m) => m.id !== id),
    })),

  setDefaultPaymentMethod: (id) =>
    set((s) => ({
      paymentMethods: s.paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      })),
    })),

  updateBillingInfo: (info) =>
    set((s) => ({
      billingInfo: { ...s.billingInfo, ...info },
    })),

  cancelSubscription: () =>
    set({ subscriptionStatus: "cancelled" }),

  reactivateSubscription: () =>
    set((s) => ({
      subscriptionStatus: "active",
      renewalDate: futureDate(s.billingCycle === "yearly" ? 12 : 1),
    })),
}));
