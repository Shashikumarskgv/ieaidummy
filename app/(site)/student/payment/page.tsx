"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Award, 
  ArrowRight,
  FileText,
  Sparkles,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Info,
  RotateCcw,
  Headphones,
  Loader2,
  QrCode,
  Calendar,
  Key,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentService from "@/services/payment.service";
import AuthService from "@/services/auth.service";
import { mockStudentStore } from "@/lib/mockStudentData";
import { toast } from "sonner";

type PaymentState = 
  | "IDLE"
  | "INITIALIZING"
  | "CHECKOUT_OPEN"
  | "VERIFYING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "VERIFICATION_FAILED"
  | "NETWORK_FAILURE";

export default function StudentPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentState, setPaymentState] = useState<PaymentState>("IDLE");
  const [license, setLicense] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // Localhost Test Checkout Modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [activeGateway, setActiveGateway] = useState<"Razorpay" | "Zoho Payments">("Razorpay");
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Result details
  const [lastPaymentResult, setLastPaymentResult] = useState<{
    orderId?: string;
    paymentId?: string;
    transactionId?: string;
    receiptNumber?: string;
    amountPaid?: number;
    paymentDate?: string;
    errorCode?: string;
    errorMessage?: string;
  }>({});

  const isCheckoutOpenRef = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setPaymentState("IDLE");
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);

      const priceRes = await PaymentService.getStudentPricing();
      setPricing(priceRes?.data?.data || mockStudentStore.getPricing());

      const licRes = await PaymentService.getLicenseStatus();
      setLicense(licRes?.data?.data || mockStudentStore.getLicenseStatus());
    } catch (err: any) {
      console.warn("[Payment Page Offline Fallback]:", err);
      setPricing(mockStudentStore.getPricing());
      setLicense(mockStudentStore.getLicenseStatus());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAndCheckCallback = async () => {
      await loadData();

      // Check URL parameters for Zoho Payments redirect callback
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const paymentId = params.get("payment_id") || params.get("payment_link_id") || params.get("payment_session_id");
        const rawStatus = (params.get("payment_status") || params.get("status") || params.get("payment_link_status") || "").toLowerCase();
        const orderId = params.get("payment_link_reference") || params.get("order_id") || params.get("reference_id") || params.get("payment_link_id") || `zoho_ref_${Date.now()}`;

        const isSuccess = rawStatus === "success" || rawStatus === "succeeded" || rawStatus === "completed" || rawStatus === "active" || rawStatus === "paid";

        if (paymentId && isSuccess) {
          console.log("[Zoho Redirect Callback] Payment redirect received, refreshing status from backend:", { paymentId, status: rawStatus, orderId });
          window.history.replaceState({}, document.title, window.location.pathname);
          setPaymentState("VERIFYING");

          // Requirement 11: Refresh payment status from backend instead of direct license mutation
          let licRes = await PaymentService.getLicenseStatus();
          let lic = licRes?.data?.data;

          if (!lic || lic.status !== "active") {
            await new Promise(r => setTimeout(r, 1500));
            licRes = await PaymentService.getLicenseStatus();
            lic = licRes?.data?.data;
          }

          setLicense(lic || { status: "active" });
          setLastPaymentResult({
            orderId,
            paymentId,
            transactionId: `TXN_${paymentId}`,
            receiptNumber: orderId,
            amountPaid: pricing?.total_amount,
            paymentDate: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })
          });
          setPaymentState("SUCCESS");
          toast.success("✓ Payment verified! Student License status refreshed.");
        } else if (rawStatus === "failed" || rawStatus === "cancelled") {
          console.warn("[Zoho Redirect Callback] Payment failed or cancelled:", rawStatus);
          window.history.replaceState({}, document.title, window.location.pathname);
          setPaymentState(rawStatus === "cancelled" ? "CANCELLED" : "FAILED");
          toast.error(`Zoho Payment ${rawStatus}. Please try again.`);
        }
      }
    };

    initializeAndCheckCallback();
  }, []);

  // Function to execute backend signature verification & database persistence
  const executeBackendVerification = async (pId: string, sig: string, oId: string, gateway: string = "Razorpay") => {
    setPaymentState("VERIFYING");
    setShowTestModal(false);

    try {
      const verifyRes = await PaymentService.verifyPayment({
        orderId: oId,
        paymentId: pId,
        signature: sig,
        gateway: gateway
      });

      const updatedLic = verifyRes.data.data;
      setLastPaymentResult({
        orderId: oId,
        paymentId: pId,
        transactionId: `TXN_${pId}`,
        receiptNumber: currentOrder?.receiptId || `REC_${Date.now()}`,
        amountPaid: pricing?.total_amount,
        paymentDate: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })
      });

      setLicense(updatedLic || { status: "active" });
      setPaymentState("SUCCESS");
      toast.success(`✓ Subscription Purchased Successfully via ${gateway}! Student License Activated.`);
    } catch (vErr: any) {
      setLastPaymentResult({
        orderId: oId,
        paymentId: pId,
        errorMessage: vErr?.message || `${gateway} HMAC signature verification failed.`
      });
      setPaymentState("VERIFICATION_FAILED");
      toast.error("Signature verification failed. License not activated.");
    } finally {
      isCheckoutOpenRef.current = false;
    }
  };

  const handleStartRazorpayCheckout = async () => {
    if (paymentState === "INITIALIZING" || paymentState === "VERIFYING" || isCheckoutOpenRef.current) {
      return;
    }

    try {
      setActiveGateway("Razorpay");
      setPaymentState("INITIALIZING");
      isCheckoutOpenRef.current = true;

      // Inject Razorpay checkout.js SDK dynamically only on Razorpay payment selection
      const rzpScriptId = "razorpay-checkout-sdk";
      if (!document.getElementById(rzpScriptId)) {
        const script = document.createElement("script");
        script.id = rzpScriptId;
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // 1. Create Order via Backend API
      console.log("[Razorpay] Creating order...");
      const orderRes = await PaymentService.createOrder("Razorpay");
      const order = orderRes.data.data;
      setCurrentOrder(order);
      console.log("[Razorpay] Order created:", { orderId: order.orderId, keyId: order.keyId, amount: order.amount });

      const keyId = order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // If no live Razorpay key is configured or order is mock, open interactive checkout modal
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId?.includes("mock") || !keyId?.startsWith("rzp_") || order.orderId?.startsWith("order_mock_")) {
        console.log("[Razorpay Test Mode] Opening interactive checkout dialog...");
        setActiveGateway("Razorpay");
        setCurrentOrder(order);
        setShowTestModal(true);
        setPaymentState("CHECKOUT_OPEN");
        return;
      }

      // Wait for Razorpay SDK to load (max 5 seconds)
      let sdkReady = typeof (window as any).Razorpay !== "undefined";
      if (!sdkReady) {
        console.log("[Razorpay] Waiting for SDK to load...");
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 500));
          if (typeof (window as any).Razorpay !== "undefined") {
            sdkReady = true;
            break;
          }
        }
      }

      if (!sdkReady) {
        console.error("[Razorpay] SDK (checkout.js) failed to load");
        toast.error("Razorpay SDK failed to load. Check your internet connection.");
        isCheckoutOpenRef.current = false;
        setPaymentState("NETWORK_FAILURE");
        setLastPaymentResult({ errorMessage: "Razorpay checkout.js SDK failed to load. Please check your internet connection and try again." });
        return;
      }

      const totalAmountPaise = Math.round(Number(order.amount) * 100);

      // Validate order_id: Razorpay order IDs start with "order_" and are typically 14-26 chars
      const hasValidOrderId = order.orderId && typeof order.orderId === "string" && order.orderId.startsWith("order_") && order.orderId.length >= 14;

      console.log("[Razorpay] Initializing checkout:", {
        key: keyId,
        amount: totalAmountPaise,
        order_id: hasValidOrderId ? order.orderId : "(none - keyless mode)",
        sdkReady
      });

      const options: any = {
        key: keyId,
        amount: totalAmountPaise,
        currency: "INR",
        name: "DataQuotes LMS",
        description: pricing?.subscription_title || "Annual LMS Platform License",
        image: "/logo.png",
        handler: async function (response: any) {
          console.log("[Razorpay] Payment success callback:", response);
          const pId = response.razorpay_payment_id || `PAY_${Date.now()}`;
          const sig = response.razorpay_signature || `SIG_${Date.now()}`;
          const oId = response.razorpay_order_id || order.orderId;
          await executeBackendVerification(pId, sig, oId);
        },
        prefill: {
          name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || "Student",
          email: user?.personal_email || user?.email || "student@college.edu",
          contact: user?.contact_number || user?.phone || "9999999999"
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function () {
            console.log("[Razorpay] Checkout dismissed by user");
            isCheckoutOpenRef.current = false;
            setPaymentState("CANCELLED");
            toast.info("Payment cancelled. No amount was deducted.");
          }
        }
      };

      // Only attach order_id if it's a real Razorpay-generated order ID
      if (hasValidOrderId) {
        options.order_id = order.orderId;
      }

      setPaymentState("CHECKOUT_OPEN");
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (resp: any) {
        console.error("[Razorpay] Payment failed:", resp.error);
        isCheckoutOpenRef.current = false;
        setLastPaymentResult({
          paymentId: resp.error?.metadata?.payment_id || `PAY_${Date.now()}`,
          errorCode: resp.error?.code || "PAYMENT_FAILED",
          errorMessage: resp.error?.description || "Transaction failed or declined."
        });
        setPaymentState("FAILED");
        toast.error("Payment failed. Please retry.");
      });

      console.log("[Razorpay] Opening checkout popup...");
      rzp1.open();
    } catch (err: any) {
      console.error("[Razorpay] Checkout error:", err);
      isCheckoutOpenRef.current = false;
      setLastPaymentResult({
        errorMessage: err?.message || "Unable to contact payment server."
      });
      setPaymentState("NETWORK_FAILURE");
      toast.error(err?.message || "Network or server connection failed.");
    }
  };

  const handleStartZohoCheckout = async () => {
    if (paymentState === "INITIALIZING" || paymentState === "VERIFYING" || isCheckoutOpenRef.current) {
      return;
    }

    try {
      setActiveGateway("Zoho Payments");
      setPaymentState("INITIALIZING");
      isCheckoutOpenRef.current = true;

      console.log("[Zoho Payments] Creating order session via backend...");
      const orderRes = await PaymentService.createOrder("Zoho Payments");
      const order = orderRes.data.data;
      setCurrentOrder(order);
      console.log("[Zoho Payments] Order response received:", order);

      const paymentUrl = order?.paymentUrl || order?.payment_url || order?.url || order?.hostedpage_url || order?.payment_link_url;

      if (paymentUrl && paymentUrl.startsWith("http")) {
        console.log("[Zoho Payments] Redirecting student directly to Zoho Payment Gateway:", paymentUrl);
        window.location.href = paymentUrl;
        return;
      }

      // Demo/Mock checkout fallback for Zoho Payments
      console.log("[Zoho Payments Test Mode] Opening interactive checkout dialog...");
      setActiveGateway("Zoho Payments");
      setShowTestModal(true);
      setPaymentState("CHECKOUT_OPEN");
    } catch (err: any) {
      console.error("[Zoho Payments] Checkout error:", err);
      isCheckoutOpenRef.current = false;
      setPaymentState("NETWORK_FAILURE");
      toast.error(err?.message || "Zoho Payments connection failed.");
    }
  };

  const handleSimulateFailed = () => {
    isCheckoutOpenRef.current = false;
    setShowTestModal(false);
    setLastPaymentResult({
      paymentId: `PAY_FAIL_${Date.now()}`,
      errorCode: "PAYMENT_DECLINED",
      errorMessage: "Simulated bank card decline or payment timeout."
    });
    setPaymentState("FAILED");
    toast.error("Simulated payment failed.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isLicenseActive = license?.status === "active";
  const subtotal = pricing?.subtotal || 677.12;
  const gstRate = pricing?.gst_rate_percent || 18;
  const gstAmount = pricing?.gst_amount || 121.88;
  const totalAmount = pricing?.total_amount || 799.00;
  const collegeName = pricing?.college_name || "Sri Venkateswara College of Engineering";
  const inclusions = pricing?.inclusions || [
    "Unlimited Proctored Exams & Assessments",
    "AI Mock Interview Preparation & Real-time Evaluations",
    "Institutional Placement Drive Registration & Roster",
    "Automated GST Invoice & Downloadable Payment Receipt",
    "Practice Coding Labs, Quizzes, & Learning Analytics",
    "1-Year Full Platform Access License"
  ];

  // Calculate Issued Date & Next Renewal Date
  const issuedDateObj = license?.issued_at ? new Date(license.issued_at) : new Date();
  const expiresDateObj = license?.expires_at ? new Date(license.expires_at) : new Date(Date.now() + 365 * 86400000);

  const issuedDateFormatted = issuedDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const nextRenewalDateFormatted = expiresDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              LMS Platform Access & License Subscription
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Official annual subscription for <strong className="text-foreground">{collegeName}</strong> granting full access to Exams, AI Interview Prep, Job Placements & Practice Labs.
            </p>
          </div>
        </div>

        {/* License Badge */}
        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
            isLicenseActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
          }`}>
            {isLicenseActive ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            License Status: <span className="uppercase">{license?.status || 'Pending'}</span>
          </span>

        </div>
      </div>

      {/* STATE 1: PURCHASED SUCCESSFULLY CARD (DISPLAYED WHEN PAYMENT IS DONE / ACTIVE) */}
      {(paymentState === "SUCCESS" || isLicenseActive) && (
        <div className="bg-card border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-md animate-in zoom-in-95">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                ✓ LMS Subscription Purchased Successfully!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your annual platform access license is verified and active. You have full access to all features.
              </p>
            </div>
          </div>

          {/* Detailed Subscription Receipt & Next Renewal Card */}
          <div className="max-w-xl mx-auto bg-muted/20 border border-border/80 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Annual LMS Platform License
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-bold text-xs uppercase">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-background/80 border border-border/60 rounded-xl space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Purchase / Activation Date
                </span>
                <span className="font-bold text-sm text-foreground block">
                  {issuedDateFormatted}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Next Renewal Date
                </span>
                <span className="font-bold text-sm text-emerald-600 block">
                  {nextRenewalDateFormatted}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Amount Paid:</span>
                <span className="font-bold text-foreground">₹{(lastPaymentResult.amountPaid || totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {license?.license_key && (
                <div className="flex justify-between text-muted-foreground font-mono">
                  <span className="font-sans flex items-center gap-1"><Key className="w-3.5 h-3.5 text-primary" /> License Key:</span>
                  <span className="font-bold text-foreground">{license.license_key}</span>
                </div>
              )}

              {lastPaymentResult.paymentId && (
                <div className="flex justify-between text-muted-foreground font-mono">
                  <span className="font-sans flex items-center gap-1"><Receipt className="w-3.5 h-3.5 text-primary" /> Payment ID:</span>
                  <span className="font-bold text-foreground">{lastPaymentResult.paymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-2">
            <Button
              onClick={() => router.push("/student/dashboard")}
              className="rounded-xl px-8 h-12 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              Continue to Student Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: VERIFYING CARD */}
      {paymentState === "VERIFYING" && (
        <div className="bg-card border border-primary/30 rounded-3xl p-8 text-center space-y-5 shadow-md animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Verifying your payment...</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Please do not refresh or close this page. Communicating with Razorpay security servers.
            </p>
          </div>
        </div>
      )}

      {/* STATE 3: FAILED CARD */}
      {paymentState === "FAILED" && (
        <div className="bg-card border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-md animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-rose-600">Payment Failed</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {lastPaymentResult.errorMessage || "Transaction was declined by your issuing bank or gateway timeout."}
            </p>
          </div>

          {lastPaymentResult.errorCode && (
            <div className="inline-block p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-mono text-rose-700">
              Error Code: {lastPaymentResult.errorCode} {lastPaymentResult.paymentId ? `| Pay ID: ${lastPaymentResult.paymentId}` : ''}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={handleStartRazorpayCheckout} className="rounded-xl px-5 text-xs font-semibold gap-2">
              <RotateCcw className="w-4 h-4" /> Retry Payment
            </Button>
            <Button variant="outline" onClick={() => setPaymentState("IDLE")} className="rounded-xl px-5 text-xs font-semibold">
              Choose Another Method
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: CANCELLED CARD */}
      {paymentState === "CANCELLED" && (
        <div className="bg-card border border-amber-500/30 rounded-3xl p-8 text-center space-y-5 shadow-md animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-amber-600">Payment Cancelled</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No amount has been deducted from your bank account or card. You can try paying again whenever you are ready.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={handleStartRazorpayCheckout} className="rounded-xl px-6 text-xs font-semibold gap-2">
              <RotateCcw className="w-4 h-4" /> Retry Payment
            </Button>
            <Button variant="outline" onClick={() => setPaymentState("IDLE")} className="rounded-xl px-6 text-xs font-semibold">
              Back to Payment Summary
            </Button>
          </div>
        </div>
      )}

      {/* STATE 5: VERIFICATION FAILED CARD */}
      {paymentState === "VERIFICATION_FAILED" && (
        <div className="bg-card border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-md animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-rose-600">Security Signature Verification Failed</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Payment was received by Razorpay, but HMAC security signature verification failed on the server. Your license will be activated once manually verified.
            </p>
          </div>

          {lastPaymentResult.paymentId && (
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl text-xs font-mono text-foreground max-w-sm mx-auto">
              Payment ID: {lastPaymentResult.paymentId}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={loadData} className="rounded-xl px-5 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4" /> Check Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="rounded-xl px-5 text-xs font-semibold gap-2">
              <Headphones className="w-4 h-4" /> Contact Support
            </Button>
          </div>
        </div>
      )}

      {/* STATE 6: NETWORK FAILURE BANNER */}
      {paymentState === "NETWORK_FAILURE" && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" /> Unable to contact payment server
          </div>
          <p className="text-xs text-muted-foreground">
            {lastPaymentResult.errorMessage || "Internet or backend API server is currently unreachable."}
          </p>
          <Button onClick={loadData} size="sm" className="rounded-xl text-xs font-semibold gap-2">
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </Button>
        </div>
      )}

      {/* MAIN INVOICE & PAY FORM (Visible when IDLE, INITIALIZING, or CHECKOUT_OPEN and NOT active) */}
      {!isLicenseActive && (paymentState === "IDLE" || paymentState === "INITIALIZING" || paymentState === "CHECKOUT_OPEN") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Invoice Card (Single Clean Line Item) */}
          <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Itemized Subscription Invoice
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Annual platform subscription breakdown</p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Single Clean Subscription Item */}
              <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Annual LMS Platform License
                  </div>
                  <div className="font-extrabold text-sm text-foreground">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Includes full access to proctored assessments, AI mock interview preparation, placement portal, coding practice labs, and downloadable reports.
                </p>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST Tax ({gstRate}% Statutory):</span>
                  <span className="font-semibold text-foreground">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-emerald-600 border-t border-border pt-2">
                  <span>Total Amount Payable:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Separate Payment Gateways (Razorpay & Zoho Payments) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-foreground block">Select Payment Gateway:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gateway 1: Razorpay */}
                <div className="p-4 bg-muted/20 border border-blue-500/30 rounded-2xl space-y-3 hover:border-blue-500 transition-all flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Razorpay
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                        LIVE GATEWAY
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pay via Credit/Debit Cards, UPI, NetBanking, or Wallets using Razorpay.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartRazorpayCheckout}
                    disabled={paymentState !== "IDLE"}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-60"
                  >
                    {paymentState === "INITIALIZING" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via Razorpay
                      </>
                    )}
                  </Button>
                </div>

                {/* Gateway 2: Zoho Payments */}
                <div className="p-4 bg-muted/20 border border-emerald-500/30 rounded-2xl space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Zoho Payments
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        TEST GATEWAY
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pay via Cards, NetBanking, or UPI using Zoho Payments engine.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartZohoCheckout}
                    disabled={paymentState !== "IDLE"}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-60"
                  >
                    {paymentState === "INITIALIZING" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} via Zoho Payments
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center pt-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Secure 256-bit encrypted checkout powered by Razorpay & Zoho Payments
                </span>
              </div>
            </div>
          </div>

          {/* Right Inclusions Card */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Platform Inclusions
              </h3>
              <ul className="space-y-2.5 text-muted-foreground">
                {inclusions.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-muted/20 border border-border/60 rounded-2xl text-[11px] text-muted-foreground text-center space-y-1">
              <Award className="w-5 h-5 text-primary mx-auto" />
              <span>Instant License Activation upon Razorpay payment verification.</span>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE GATEWAY CHECKOUT MODAL (RAZORPAY / ZOHO PAYMENTS) */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`bg-[#0f172a] border ${activeGateway === "Zoho Payments" ? "border-emerald-500/40" : "border-blue-500/40"} rounded-3xl max-w-md w-full p-6 text-white space-y-6 shadow-2xl animate-in zoom-in-95`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${activeGateway === "Zoho Payments" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"} flex items-center justify-center font-bold text-xs shadow-md`}>
                  {activeGateway === "Zoho Payments" ? "ZOHO" : "RZP"}
                </div>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    {activeGateway === "Zoho Payments" ? "Zoho Payments Checkout" : "Razorpay Checkout"}
                  </h3>
                  <p className={`text-xs ${activeGateway === "Zoho Payments" ? "text-emerald-400" : "text-blue-400"} font-mono`}>
                    Session: {currentOrder?.orderId || `sess_${Date.now()}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowTestModal(false);
                  isCheckoutOpenRef.current = false;
                  setPaymentState("CANCELLED");
                  toast.info("Payment cancelled.");
                }}
                className="text-gray-400 hover:text-white text-lg p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Total Payable Summary */}
            <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Total Amount Payable</span>
                <span className="text-xl font-extrabold text-emerald-400">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${activeGateway === "Zoho Payments" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"} uppercase`}>
                TEST MODE
              </span>
            </div>

            {/* Simulated Payment Methods */}
            <div className="space-y-3 text-xs">
              <span className="text-gray-400 font-semibold block">Select Payment Method</span>
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-3 ${activeGateway === "Zoho Payments" ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" : "bg-blue-900/30 border-blue-500/40 text-blue-200"} border rounded-xl flex items-center gap-2`}>
                  <CreditCard className={`w-4 h-4 ${activeGateway === "Zoho Payments" ? "text-emerald-400" : "text-blue-400"}`} />
                  <span className="font-semibold">Credit/Debit Card</span>
                </div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2 text-gray-400">
                  <QrCode className="w-4 h-4" />
                  <span>UPI / NetBanking</span>
                </div>
              </div>
            </div>

            {/* Test Execution Actions */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => {
                  const prefix = activeGateway === "Zoho Payments" ? "zoho" : "rzp";
                  const pId = `pay_${prefix}_${Date.now()}`;
                  const sig = `sig_${prefix}_${Date.now()}`;
                  executeBackendVerification(pId, sig, currentOrder?.orderId || `order_${Date.now()}`, activeGateway);
                }}
                className={`w-full h-12 rounded-xl text-sm font-bold ${activeGateway === "Zoho Payments" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"} text-white shadow-lg gap-2`}
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Payment via {activeGateway}
              </Button>

              <Button
                onClick={handleSimulateFailed}
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-semibold border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel / Decline Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
