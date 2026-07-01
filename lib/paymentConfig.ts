// lib/paymentConfig.ts
// Modular payment gateway configuration — Razorpay-ready.
// Simply paste your Razorpay API keys below to activate payments.
// All payment logic is isolated here so the billing UI never needs to change.

// ─── Razorpay API Keys ───────────────────────────────────────────────────────
// Replace these with your actual Razorpay keys from https://dashboard.razorpay.com
export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXXXXXX",
  KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",         // server-side only
  CURRENCY: "INR",
  COMPANY_NAME: "ScheduleAI",
  COMPANY_LOGO: "/logo.png",                                 // shown in Razorpay modal
  THEME_COLOR: "#6C63FF",
} as const;

// ─── Plan & Pricing Types ────────────────────────────────────────────────────
export type PlanId = "free" | "pro" | "promax";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  recommended?: boolean;
  color: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

// ─── Plan Definitions ────────────────────────────────────────────────────────
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For individuals getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "#6b7280",
    features: [
      { text: "1 User", included: true },
      { text: "Limited meetings (10/month)", included: true },
      { text: "Basic scheduling", included: true },
      { text: "Email notifications", included: true },
      { text: "Team scheduling", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For teams that need more power",
    monthlyPrice: 799,
    yearlyPrice: 7999,
    color: "#6C63FF",
    recommended: true,
    features: [
      { text: "Up to 10 users", included: true },
      { text: "Unlimited meetings", included: true },
      { text: "Advanced scheduling", included: true },
      { text: "Email notifications", included: true },
      { text: "Team scheduling", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "promax",
    name: "Pro Max",
    tagline: "For organizations at scale",
    monthlyPrice: 1999,
    yearlyPrice: 19999,
    color: "#00D4FF",
    features: [
      { text: "Unlimited users", included: true },
      { text: "Unlimited meetings", included: true },
      { text: "Advanced scheduling", included: true },
      { text: "Email notifications", included: true },
      { text: "Team scheduling", included: true },
      { text: "Advanced analytics", included: true },
      { text: "White-label branding", included: true },
      { text: "Priority support (24/7)", included: true },
    ],
  },
];

// ─── Payment Gateway Integration ─────────────────────────────────────────────
// This function initializes a Razorpay checkout session.
// Once you have your Razorpay keys, this will work out of the box.
// The billing UI calls this — no need to modify the billing component.

export async function initializePayment(options: {
  amount: number;        // in smallest currency unit (paise for INR)
  planId: PlanId;
  cycle: BillingCycle;
  customerEmail: string;
  customerName: string;
}): Promise<PaymentResult> {
  // ─── Step 1: Create order on your backend ──────────────────────────────
  // In production, call your API route:
  //   const order = await fetch("/api/billing/create-order", {
  //     method: "POST",
  //     body: JSON.stringify({ amount: options.amount, planId: options.planId }),
  //   }).then(r => r.json());

  // For now, simulate a successful order creation
  const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // ─── Step 2: Open Razorpay checkout ────────────────────────────────────
  // Uncomment the block below when you have a real Razorpay key:
  //
  // return new Promise((resolve) => {
  //   const rzp = new (window as any).Razorpay({
  //     key: RAZORPAY_CONFIG.KEY_ID,
  //     amount: options.amount,
  //     currency: RAZORPAY_CONFIG.CURRENCY,
  //     name: RAZORPAY_CONFIG.COMPANY_NAME,
  //     description: `${options.planId.toUpperCase()} Plan — ${options.cycle}`,
  //     image: RAZORPAY_CONFIG.COMPANY_LOGO,
  //     order_id: order.id,           // from your backend
  //     prefill: {
  //       name: options.customerName,
  //       email: options.customerEmail,
  //     },
  //     theme: { color: RAZORPAY_CONFIG.THEME_COLOR },
  //     handler: (response: any) => {
  //       resolve({
  //         success: true,
  //         paymentId: response.razorpay_payment_id,
  //         orderId: response.razorpay_order_id,
  //         signature: response.razorpay_signature,
  //       });
  //     },
  //     modal: {
  //       ondismiss: () => resolve({ success: false, error: "Payment cancelled by user" }),
  //     },
  //   });
  //   rzp.open();
  // });

  // ─── Mock: simulate successful payment ─────────────────────────────────
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        paymentId: `pay_${Date.now()}`,
        orderId: mockOrderId,
        signature: `sig_${Math.random().toString(36).slice(2, 12)}`,
      });
    }, 1500);
  });
}

// ─── Server-side Signature Verification ──────────────────────────────────────
// Use this in your API route (e.g. /api/billing/verify-payment)
// to verify the payment signature from Razorpay.
//
// import crypto from "crypto";
// export function verifyPaymentSignature(
//   orderId: string,
//   paymentId: string,
//   signature: string
// ): boolean {
//   const body = orderId + "|" + paymentId;
//   const expectedSignature = crypto
//     .createHmac("sha256", RAZORPAY_CONFIG.KEY_SECRET)
//     .update(body)
//     .digest("hex");
//   return expectedSignature === signature;
// }
