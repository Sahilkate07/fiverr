import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams, useNavigate } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";
import { toast } from "react-toastify";

// Load Stripe Publishable Key
const stripePromise = loadStripe(
  "pk_test_51Qo4R9RxHUsS6SDEoRfuMqqOzrUNH3te5xl1RljQPF4oHwwrByEdmVivQeoPczML8KnIyhJuQqtScBwOFxYIv01y004MByumlV"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        
        if (!currentUser?._id || !currentUser?.token) {
          toast.error("Please login to proceed with payment");
          localStorage.setItem("redirectAfterLogin", `/pay/${id}`);
          navigate("/login");
          return;
        }

        // Set authorization header with token
        const res = await newRequest.post(
          `/orders/create-payment-intent/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`
            }
          }
        );

        if (!res.data?.clientSecret) {
          throw new Error("Failed to initialize payment");
        }

        setClientSecret(res.data.clientSecret);
        setLoading(false);
      } catch (err) {
        console.error("Payment initialization error:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to initialize payment";
        setError(errorMessage);
        toast.error(errorMessage);
        
        if (err.response?.status === 401) {
          localStorage.setItem("redirectAfterLogin", `/pay/${id}`);
          navigate("/login");
        }
        setLoading(false);
      }
    };

    initializePayment();
  }, [id, navigate]);

  if (!stripePromise) {
    return <div className="pay">Payment system is currently unavailable. Please try again later.</div>;
  }

  return (
    <div className="pay">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading payment details...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>⚠ Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : clientSecret ? (
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div className="error">
          <p>⚠ Error: Could not initialize payment form.</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default Pay;
