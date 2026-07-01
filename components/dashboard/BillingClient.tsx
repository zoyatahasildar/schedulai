// components/dashboard/BillingClient.tsx
// Full Billing & Subscription page — dark-first design.
// All logic uses mock data via billingStore until backend is connected.
// Owned by: Lead
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard, Check, X, Crown, Sparkles, Zap,
  Download, Plus, Trash2, Star, ArrowRight,
  Receipt, Building2, Shield, ChevronRight,
  AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { PLANS, initializePayment, type PlanId, type BillingCycle } from "@/lib/paymentConfig";
import { useBillingStore, type PaymentMethod } from "@/store/billingStore";

const MONO = { fontFamily: "var(--font-mono), monospace" } as const;

const PLAN_ICONS: Record<PlanId, typeof Crown> = {
  free: Zap,
  pro: Crown,
  promax: Sparkles,
};

const CARD_BRANDS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  rupay: "RuPay",
};

export function BillingClient() {
  const { data: session } = useSession();
  const billing = useBillingStore();
  const [cycle, setCycle] = useState<BillingCycle>(billing.billingCycle);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ planId: PlanId; action: "upgrade" | "downgrade" } | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; variant: "success" | "error" }>({
    visible: false, message: "", variant: "success",
  });

  const showToast = (message: string, variant: "success" | "error" = "success") => {
    setToast({ visible: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const currentPlanData = PLANS.find((p) => p.id === billing.currentPlan)!;
  const price = (plan: typeof PLANS[0]) =>
    cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const handlePlanAction = async (planId: PlanId) => {
    if (planId === billing.currentPlan) return;
    const planOrder: PlanId[] = ["free", "pro", "promax"];
    const currentIdx = planOrder.indexOf(billing.currentPlan);
    const targetIdx = planOrder.indexOf(planId);
    setShowConfirm({ planId, action: targetIdx > currentIdx ? "upgrade" : "downgrade" });
  };

  const handleDowngrade = () => {
    if (!showConfirm || showConfirm.action !== "downgrade") return;
    const { planId } = showConfirm;
    const plan = PLANS.find((p) => p.id === planId)!;

    billing.downgradePlan(planId);
    showToast(`Switched to ${plan.name} plan`);
    setShowConfirm(null);
  };



  const downloadInvoice = (invoiceId: string) => {
    // Placeholder for PDF download
    showToast(`Downloading ${invoiceId}...`);
    console.log(`[Billing] Download invoice: ${invoiceId}`);
  };

  const handleExportCSV = () => {
    if (billing.invoices.length === 0) {
      showToast("No invoices to export.", "error");
      return;
    }

    const headers = ["Invoice ID", "Date", "Plan", "Amount (INR)", "Status"];
    const rows = billing.invoices.map((inv) => 
      [inv.id, inv.date, inv.plan, inv.amount, inv.status].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exported invoices to CSV!");
  };

  const yearlySavings = Math.round((1 - (currentPlanData.yearlyPrice / (currentPlanData.monthlyPrice * 12))) * 100);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-[#6C63FF]/25">
            <CreditCard className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">Billing & Subscription</h1>
            <p className="text-[13px] text-white/50">Manage your plan, payment methods, and invoices.</p>
          </div>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#234876] to-[#2b6cb0] rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              {(() => { const Icon = PLAN_ICONS[billing.currentPlan]; return <Icon className="w-7 h-7 text-white" />; })()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-[20px] font-bold text-white">{currentPlanData.name} Plan</h2>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  billing.subscriptionStatus === "active"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : billing.subscriptionStatus === "cancelled"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}>
                  {billing.subscriptionStatus}
                </span>
              </div>
              <p className="text-[13px] text-white/60">
                {billing.currentPlan === "free"
                  ? "Upgrade to unlock unlimited meetings and more."
                  : `Next renewal: ${new Date(billing.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · ${billing.billingCycle === "yearly" ? "Annual" : "Monthly"} billing`}
              </p>
            </div>
          </div>
          {billing.currentPlan !== "promax" && (
            <button
              onClick={() => handlePlanAction(billing.currentPlan === "free" ? "pro" : "promax")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white text-[13px] font-bold rounded-xl border border-white/20 hover:bg-white/25 transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" /> Upgrade Now
            </button>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-white">Choose Your Plan</h2>
            <p className="text-[13px] text-white/45 mt-0.5">Select the plan that best fits your needs.</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 bg-[#131a2e] rounded-xl p-1 border border-white/[0.06]">
            <button
              onClick={() => setCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                cycle === "monthly"
                  ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/25"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
                cycle === "yearly"
                  ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/25"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Yearly
              {yearlySavings > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Save {yearlySavings}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === billing.currentPlan;
            const planPrice = price(plan);
            const PlanIcon = PLAN_ICONS[plan.id];

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-[1px] transition-all duration-300 ${
                  plan.recommended
                    ? "bg-gradient-to-br from-[#6C63FF] via-[#00D4FF] to-[#6C63FF]"
                    : "bg-white/[0.06]"
                } ${isCurrentPlan ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-[#6C63FF]/30">
                      <Star className="w-3 h-3 fill-white" /> Recommended
                    </span>
                  </div>
                )}

                <div className={`rounded-2xl p-6 h-full flex flex-col ${
                  plan.recommended ? "bg-[#0f1629]" : "bg-[#131a2e]"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${plan.color}22` }}>
                      <PlanIcon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-white">{plan.name}</h3>
                      <p className="text-[11px] text-white/40">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[32px] font-bold text-white" style={MONO}>
                        {planPrice === 0 ? "Free" : `₹${planPrice.toLocaleString("en-IN")}`}
                      </span>
                      {planPrice > 0 && (
                        <span className="text-[13px] text-white/40 font-medium">
                          /{cycle === "yearly" ? "year" : "month"}
                        </span>
                      )}
                    </div>
                    {cycle === "yearly" && plan.monthlyPrice > 0 && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1">
                        Save ₹{(plan.monthlyPrice * 12) - plan.yearlyPrice}/year
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {f.included ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="w-4 h-4 text-white/20 flex-shrink-0" strokeWidth={2} />
                        )}
                        <span className={`text-[13px] ${f.included ? "text-white/80" : "text-white/30"}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlanAction(plan.id)}
                    disabled={isCurrentPlan || upgrading === plan.id}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all ${
                      isCurrentPlan
                        ? "bg-emerald-500/15 text-emerald-300 cursor-default"
                        : plan.recommended
                        ? "bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-lg shadow-[#6C63FF]/25 hover:scale-[1.02] active:scale-95"
                        : "bg-white/[0.06] text-white/80 hover:bg-white/[0.1] border border-white/[0.06]"
                    } disabled:opacity-60`}
                  >
                    {upgrading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Current Plan
                      </>
                    ) : (
                      <>
                        {PLANS.indexOf(plan) > PLANS.findIndex((p) => p.id === billing.currentPlan) ? "Upgrade" : "Switch"} to {plan.name}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Invoice History */}
      <div className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#6C63FF]" />
            <h3 className="text-[16px] font-bold text-white">Invoice History</h3>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={billing.invoices.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-white/80 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {billing.invoices.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-[13px] text-white/40">No invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-white/35" style={MONO}>Invoice</th>
                  <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-white/35" style={MONO}>Date</th>
                  <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-white/35" style={MONO}>Plan</th>
                  <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-white/35 text-right" style={MONO}>Amount</th>
                  <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-white/35" style={MONO}>Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 text-[13px] font-semibold text-white" style={MONO}>{inv.id}</td>
                    <td className="py-3.5 text-[13px] text-white/50">
                      {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 text-[13px] text-white/60 font-medium">{inv.plan}</td>
                    <td className="py-3.5 text-[13px] text-white/80 font-semibold text-right" style={MONO}>
                      {inv.amount === 0 ? "Free" : `₹${inv.amount.toLocaleString("en-IN")}`}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inv.status === "paid"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : inv.status === "pending"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-red-500/15 text-red-300"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => downloadInvoice(inv.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscription Management */}
      {billing.currentPlan !== "free" && (
        <div className="bg-[#131a2e] border border-white/[0.06] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-5 h-5 text-[#6C63FF]" />
            <h3 className="text-[16px] font-bold text-white">Subscription Management</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#0f1629] rounded-xl border border-white/[0.04]">
            <div>
              <p className="text-[14px] font-semibold text-white">
                {billing.subscriptionStatus === "cancelled" ? "Your subscription is cancelled" : "Cancel your subscription"}
              </p>
              <p className="text-[12px] text-white/40 mt-0.5">
                {billing.subscriptionStatus === "cancelled"
                  ? "Reactivate to regain access to premium features."
                  : "You will retain access until the end of your current billing period."}
              </p>
            </div>
            {billing.subscriptionStatus === "cancelled" ? (
              <button
                onClick={() => { billing.reactivateSubscription(); showToast("Subscription reactivated! 🎉"); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#6C63FF] text-white text-[13px] font-bold rounded-xl hover:bg-[#5a52e6] transition-colors flex-shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" /> Reactivate
              </button>
            ) : (
              <button
                onClick={() => { billing.cancelSubscription(); showToast("Subscription cancelled. Access remains until renewal date.", "error"); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/15 text-red-300 text-[13px] font-bold rounded-xl hover:bg-red-500/20 transition-colors flex-shrink-0"
              >
                <AlertTriangle className="w-4 h-4" /> Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131a2e] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                showConfirm.action === "upgrade" ? "bg-[#6C63FF]/15" : "bg-amber-500/15"
              }`}>
                {showConfirm.action === "upgrade" ? (
                  <ArrowRight className="w-5 h-5 text-[#6C63FF]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white">
                  {showConfirm.action === "upgrade" ? "Confirm Upgrade" : "Confirm Downgrade"}
                </h3>
                <p className="text-[12px] text-white/40">
                  {showConfirm.action === "upgrade"
                    ? `You'll be upgraded to the ${PLANS.find((p) => p.id === showConfirm.planId)!.name} plan.`
                    : `You'll be switched to the ${PLANS.find((p) => p.id === showConfirm.planId)!.name} plan.`}
                </p>
              </div>
            </div>
            <div className="p-3 bg-[#0f1629] rounded-xl border border-white/[0.04] mb-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/60">New plan</span>
                <span className="text-[13px] font-bold text-white">
                  {PLANS.find((p) => p.id === showConfirm.planId)!.name}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-white/60">Price</span>
                <span className="text-[13px] font-bold text-white" style={MONO}>
                  {(() => {
                    const p = PLANS.find((p) => p.id === showConfirm.planId)!;
                    const amt = cycle === "yearly" ? p.yearlyPrice : p.monthlyPrice;
                    return amt === 0 ? "Free" : `₹${amt.toLocaleString("en-IN")}/${cycle === "yearly" ? "yr" : "mo"}`;
                  })()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {showConfirm.action === "upgrade" && showConfirm.planId !== "free" ? (
                <div className="relative w-full h-[45px] rounded-xl overflow-hidden bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] shadow-lg shadow-[#6C63FF]/25 hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer group">
                  <span className="text-[13px] font-bold text-white relative z-10 pointer-events-none group-hover:scale-[1.02] transition-transform">
                    Pay Now
                  </span>
                  <div className="absolute inset-0 z-20 opacity-0 overflow-hidden flex items-center justify-center">
                    <div className="w-[500px] h-[200px] flex items-center justify-center transform scale-[4]">
                      <RazorpayButton />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors bg-amber-500/80 hover:bg-amber-500"
                >
                  Confirm Downgrade
                </button>
              )}
              <button
                onClick={() => setShowConfirm(null)}
                className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white/60 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border animate-in fade-in slide-in-from-bottom-3 duration-300 ${
          toast.variant === "success"
            ? "bg-[#131a2e] border-emerald-500/20 text-emerald-300"
            : "bg-[#131a2e] border-red-500/20 text-red-300"
        }`}>
          {toast.variant === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span className="text-[13px] font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function RazorpayButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const form = document.createElement("form");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_T4EvaSFA4AvYtM");
    script.async = true;
    form.appendChild(script);
    containerRef.current.appendChild(form);
  }, []);

  return <div ref={containerRef} className="w-full flex justify-center min-h-[45px] items-center"></div>;
}


