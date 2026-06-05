import { useState, useEffect } from "react";
import { getSubscriptionStatus } from "@/api/subscription";

export const useSubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        const result = await getSubscriptionStatus();

        if (result.success) {
          setSubscription(result.data.subscription);
          setIsSubscribed(result.data.isSubscribed);
          setDaysRemaining(result.data.daysRemaining);
        } else {
          setError(result.error);
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setError(err.message);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return {
    subscription,
    isSubscribed,
    isLoading,
    error,
    daysRemaining,
  };
};
