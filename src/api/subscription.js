import axiosInstance from "./axiosInstance";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create subscription order
export const createSubscriptionOrder = async (planType) => {
  try {
    const endpoint =
      planType === "monthly"
        ? "/subscription/create-order/monthly"
        : "/subscription/create-order/yearly";

    const response = await axiosInstance.post(endpoint);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create order",
    };
  }
};

// Verify payment signature
export const verifySubscriptionPayment = async (paymentDetails) => {
  try {
    const response = await axiosInstance.post(
      "/subscription/verify-payment",
      {
        razorpayOrderId: paymentDetails.razorpay_order_id,
        razorpayPaymentId: paymentDetails.razorpay_payment_id,
        razorpaySignature: paymentDetails.razorpay_signature,
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
  
    return {
      success: false,
      error: error.response?.data?.message || "Payment verification failed",
    };
  }
};

// Get subscription status
export const getSubscriptionStatus = async () => {
  try {
    const response = await axiosInstance.get("/subscription/status");

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
   
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch status",
    };
  }
};

// Cancel subscription
export const cancelSubscription = async () => {
  try {
    const response = await axiosInstance.post("/subscription/cancel");

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {

    return {
      success: false,
      error: error.response?.data?.message || "Failed to cancel subscription",
    };
  }
};

// Handle Razorpay payment
export const handleRazorpayPayment = async (orderData, userEmail, userName) => {
  const isLoaded = await loadRazorpay();

  if (!isLoaded) {
    return {
      success: false,
      error: "Failed to load Razorpay. Please try again.",
    };
  }

  return new Promise((resolve) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      order_id: orderData.order.id,
      amount: orderData.order.amount,
      currency: "INR",
      name: "Clix",
      description: `${orderData.order.description || "Subscription"}`,
      prefill: {
        email: userEmail,
        name: userName,
      },
      handler: async (response) => {
        // Verify payment on backend
        const verifyResult = await verifySubscriptionPayment(response);

        if (verifyResult.success) {
          resolve({
            success: true,
            message: "Payment successful! Your subscription is now active.",
            data: verifyResult.data,
          });
        } else {
          resolve({
            success: false,
            error: verifyResult.error,
          });
        }
      },
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            error: "Payment cancelled by user",
          });
        },
      },
      theme: {
        color: "#10b981",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
};
