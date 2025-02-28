import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./Orders.scss";
import { motion } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/orders`);
        return res.data;
      } catch (err) {
        console.error("❌ Error fetching orders:", err.response?.data || err.message);
        throw err;
      }
    },
  });

  const handleContact = async (order) => {
    try {
      // Determine if current user is buyer or seller
      const isSeller = currentUser.isSeller;
      const otherUserId = isSeller ? order.buyerId : order.sellerId;
      
      // Create a unique conversation ID
      const conversationId = [currentUser._id, otherUserId].sort().join('_');

      // Try to get existing conversation
      try {
        const res = await newRequest.get(`/conversations/single/${conversationId}`);
        navigate(`/message/${res.data.id}`);
      } catch (err) {
        // If conversation doesn't exist, create a new one
        if (err.response?.status === 404) {
          const res = await newRequest.post(`/conversations`, {
            to: otherUserId,
            orderId: order._id
          });
          navigate(`/message/${res.data.id}`);
        } else {
          console.error("Error handling conversation:", err);
        }
      }
    } catch (err) {
      console.error("Failed to handle contact:", err);
    }
  };

  const handleGigClick = (gigId) => {
    if (gigId) {
      navigate(`/gig/${gigId}`);
    }
  };

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
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">Error loading orders</div>
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
                      <FiMessageCircle 
                        className="message-icon"
                        size={24} 
                        onClick={() => handleContact(order)} 
                      />
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
