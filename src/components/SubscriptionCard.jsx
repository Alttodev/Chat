import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SubscriptionCard() {
  const navigate = useNavigate();
  const [processingPlanId, setProcessingPlanId] = useState(null);

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
    setProcessingPlanId(planId);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After successful subscription, redirect to profile views
      navigate("/profileViews");
    } catch (error) {
      console.error("Subscription error:", error);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="text-start">
        <h1 className="text-xl font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Subscription Plans
        </h1>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.id}
            className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-border"
          >
            {/* Card Header */}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                {plan.duration}
              </CardTitle>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {plan.description}
              </p>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="space-y-6">
              {/* Price Section */}
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

              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPlanId === plan.id}
                className="w-full py-6 font-semibold transition-all duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {processingPlanId === plan.id
                  ? "Processing..."
                  : "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 rounded-lg border border-border bg-white/50 p-6 dark:bg-slate-950/50">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground">
              Is there a free trial?
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yes, we offer a 7-day free trial for all new users.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">
              What payment methods do you accept?
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              We accept all major credit cards, PayPal, and digital wallets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
