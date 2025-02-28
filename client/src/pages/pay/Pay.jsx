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
        
        if (!currentUser?._id) {
          localStorage.setItem("redirectAfterLogin", `/pay/${id}`);
          navigate("/login");
          return;
        }

        const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
        setClientSecret(res.data.clientSecret);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize payment");
        toast.error(err.response?.data?.message || "Failed to initialize payment. Please try again.");
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
