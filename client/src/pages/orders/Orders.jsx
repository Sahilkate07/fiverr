import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./Orders.scss";
import { motion } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  const [loadingContact, setLoadingContact] = useState(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/orders`);
        console.log("Fetched orders:", res.data); // Debug log
        return res.data;
      } catch (err) {
        console.error("❌ Error fetching orders:", err.response?.data || err.message);
        throw err;
      }
    },
  });

  const handleContact = async (order) => {
    try {
      console.log("Clicked order:", order); // Debug log
      console.log("Current user:", currentUser); // Debug log

      if (!currentUser) {
        toast.error("Please login to send messages");
        navigate("/login");
        return;
      }

      setLoadingContact(order._id);

      // Get the seller ID directly from the order
      const sellerId = order.gigId?.userId || order.sellerId;
      console.log("Seller ID:", sellerId); // Debug log

      if (!sellerId) {
        toast.error("Could not find seller information");
        return;
      }

      // Create a new conversation
      const res = await newRequest.post("/conversations", {
        to: sellerId,
        orderId: order._id
      });

      console.log("Conversation response:", res.data); // Debug log

      if (res.data && res.data.id) {
        navigate(`/message/${res.data.id}`);
      } else {
        toast.error("Could not start conversation");
      }

    } catch (err) {
      console.error("Error creating conversation:", err);
      toast.error(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setLoadingContact(null);
    }
  };

  const handleGigClick = (gigId) => {
    if (gigId) {
      navigate(`/gig/${gigId}`);
    }
  };

  // Debug log for rendered data
  console.log("Rendering orders data:", data);

  return (
    <motion.div 
      className="orders"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <h1 className="title">Orders</h1>
        {isLoading ? (
          <div className="loading">Loading orders...</div>
        ) : error ? (
          <div className="error">
            Error loading orders. Please try refreshing the page.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((order) => (
                  <motion.tr 
                    key={order._id} 
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>
                      <img 
                        className="image" 
                        src={order.gigId?.cover || order.img || "/img/noimage.jpg"} 
                        alt={order.gigId?.title || "Order"} 
                        onClick={() => handleGigClick(order.gigId?._id)}
                        style={{ cursor: order.gigId?._id ? 'pointer' : 'default' }}
                      />
                    </td>
                    <td>{order.gigId?.title || order.title || "Untitled Order"}</td>
                    <td>${order.price}</td>
                    <td>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiMessageCircle 
                          className={`message-icon ${loadingContact === order._id ? 'loading' : ''}`}
                          size={24} 
                          onClick={() => handleContact(order)}
                          style={{ 
                            cursor: loadingContact === order._id ? 'wait' : 'pointer',
                            opacity: loadingContact === order._id ? 0.6 : 1,
                            color: '#1dbf73'
                          }}
                        />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-orders">No orders available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
