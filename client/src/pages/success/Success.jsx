import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Success.scss";

const Success = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        // Get parameters from URL and localStorage
        const paymentIntentId = params.get("payment_intent");
        const gigIdFromUrl = params.get("gig_id");
        const gigIdFromStorage = localStorage.getItem("gigId");
        const gigId = gigIdFromUrl || gigIdFromStorage;
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

        // Validate required data
        if (!gigId) {
          throw new Error("Missing gig information. Please try the payment again.");
        }

        if (!paymentIntentId) {
          throw new Error("Missing payment information. Please try the payment again.");
        }

        if (!currentUser?._id || !currentUser?.token) {
          throw new Error("Authentication required. Please log in and try again.");
        }

        // Create new order
        const response = await newRequest.put(
          "/orders/confirm",
          {
            gigId,
            paymentIntentId
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`
            }
          }
        );

        if (!response.data) {
          throw new Error("Failed to create order. Please contact support.");
        }

        // Clear gigId from localStorage
        localStorage.removeItem("gigId");
        localStorage.removeItem("gigData");

        // Show success message and redirect
        toast.success("🎉 Order placed successfully!");
        setTimeout(() => navigate("/orders"), 2000);

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(errorMessage);
        
        if (err.message.includes("Authentication required")) {
          localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
          setTimeout(() => navigate("/login"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [navigate, params]);

  if (loading) {
    return (
      <div className="success">
        <div className="container">
          <div className="loader"></div>
          <h1>Processing your order...</h1>
          <p>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success">
        <div className="container">
          <h1>Oops! Something went wrong</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="success">
      <div className="container">
        <h1>Payment Successful!</h1>
        <p>Your order has been confirmed.</p>
        <p>Redirecting to your orders...</p>
      </div>
    </div>
  );
};

export default Success;
