import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  createSubscriptionOrder,
  handleRazorpayPayment,
} from "@/api/subscription";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStatus } from "@/hooks/subscriptionHooks";
import { Spinner } from "./ui/shadcn-io/spinner";

function SubscriptionCard() {
  const navigate = useNavigate();
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { data, isLoading } = useSubscriptionStatus();

  const subscription = data?.subscription;
  const planType = subscription?.planType;

  const expiryDate = subscription?.subscriptionEndDate
    ? new Date(subscription.subscriptionEndDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const subscriptionPlans = [
    {
      id: "monthly",
      duration: "Monthly",
      price: "₹2",
      period: "per month",
      description: "Perfect for regular users",
      features: [
        "Priority support",
        "Profile view history",
        "30-day viewer history",
      ],
    },
    {
      id: "yearly",
      duration: "Yearly",
      price: "₹24",
      period: "per year",
      description: "Best value",
      features: [
        "24/7 priority support",
        "Profile view history",
        "Unlimited viewer history",
      ],
    },
  ];

  const handleSubscribe = async (planId) => {
    setError(null);
    setProcessingPlanId(planId);

    try {
      // Step 1: Create order on backend
      const orderResult = await createSubscriptionOrder(planId);

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      const orderData = orderResult.data;

      // Step 2: Open Razorpay payment modal
      const userEmail = user?.email || "";
      const userName = user?.name || user?.fullName || "User";

      const paymentResult = await handleRazorpayPayment(
        orderData,
        userEmail,
        userName,
      );

      if (paymentResult.success) {
        // Payment successful - redirect to profile views
        setProcessingPlanId(null);
        navigate("/profileViews");
      } else {
        throw new Error(paymentResult.error || "Payment failed");
      }
    } catch (err) {
      setError(err.message);
      setProcessingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="text-start">
        <h1 className="text-xl font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Subscription Plans
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {subscriptionPlans.map((plan) => {
          const isActivePlan = planType === plan.id;
          const hasActiveSubscription = !!subscription?.isActive;
          const isDisabled =
            hasActiveSubscription || processingPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                isActivePlan
                  ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "border-border"
              }`}
            >
              {isActivePlan && (
                <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                  Active Plan
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground">
                  {plan.duration}
                </CardTitle>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Active Plan */}
                {isActivePlan && expiryDate && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      Premium Membership Active
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Valid until {expiryDate}
                    </p>
                  </div>
                )}

                {/* Other Plan Disabled */}
                {hasActiveSubscription && !isActivePlan && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-700">
                      Active {planType === "monthly" ? "Monthly" : "Yearly"}{" "}
                      Subscription
                    </p>

                    {expiryDate && (
                      <p className="mt-1 text-xs font-medium text-amber-700">
                        Expires on {expiryDate}
                      </p>
                    )}
                  </div>
                )}

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isDisabled}
                  className={`w-full py-6 font-semibold transition-all duration-200 ${
                    isDisabled
                      ? "cursor-not-allowed bg-gray-100 text-gray-500 hover:bg-gray-100"
                      : "cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl"
                  }`}
                >
                  {isActivePlan
                    ? "Current Plan"
                    : hasActiveSubscription
                      ? "Available After Expiry"
                      : processingPlanId === plan.id
                        ? "Processing..."
                        : "Subscribe Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 rounded-lg border border-border bg-white/50 p-6 dark:bg-slate-950/50">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground">
              What payment methods do you accept?
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              We accept all major credit cards, PayPal, and digital wallets via
              Razorpay.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              Can I upgrade or downgrade anytime?
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yes, you can change your subscription plan anytime. Changes take
              effect at the next billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
