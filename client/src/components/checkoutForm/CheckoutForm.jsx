import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?._id || !currentUser?.token) {
      toast.error("Please login to proceed with payment");
      navigate("/login");
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      const gigId = localStorage.getItem("gigId");
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          navigate(`/success?payment_intent=${paymentIntent.id}&gig_id=${gigId}`);
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Please provide your payment details.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe not initialized");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?._id || !currentUser?.token) {
      toast.error("Please login to proceed with payment");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const gigId = localStorage.getItem("gigId");
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?gig_id=${gigId}`,
          payment_method_data: {
            billing_details: {
              email: currentUser.email,
              name: currentUser.username
            }
          }
        },
        redirect: "if_required"
      });

      if (error) {
        if (error.type === "validation_error") {
          setMessage(error.message);
          toast.error(error.message);
        } else if (error.type === "card_error") {
          setMessage("Your card was declined. Please try another payment method.");
          toast.error("Your card was declined. Please try another payment method.");
        } else {
          setMessage("An error occurred while processing your payment.");
          toast.error("Payment failed. Please try again.");
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage("Payment succeeded!");
        navigate(`/success?payment_intent=${paymentIntent.id}&gig_id=${gigId}`);
      } else {
        setMessage("Please wait while we process your payment...");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("An unexpected error occurred.");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Complete Your Payment</h2>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement />
        <button 
          className="submit-button"
          disabled={isProcessing || !stripe || !elements} 
          id="submit"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>

        {message && (
          <div className={`message-container ${
            message.includes("succeeded") ? "success-message" : "error-message"
          }`}>
            {message}
          </div>
        )}
      </form>

      <style jsx>{`
        .checkout-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .checkout-title {
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 24px;
          color: #333;
        }

        #payment-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .submit-button {
          background: #1dbf73;
          color: #ffffff;
          border-radius: 4px;
          border: 0;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: block;
          transition: all 0.2s ease;
          box-shadow: 0 4px 5.5px 0 rgba(0, 0, 0, 0.07);
          width: 100%;
        }

        .submit-button:hover {
          filter: brightness(1.1);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: default;
          background-color: #e0e0e0;
        }

        .message-container {
          padding: 12px;
          margin-top: 12px;
          border-radius: 4px;
          text-align: center;
          font-size: 14px;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default CheckoutForm;