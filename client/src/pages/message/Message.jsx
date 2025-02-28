import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ["messages"],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (message) => newRequest.post(`/messages`, message),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };

  return (
    <motion.div 
      className="message"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> > John Doe >
        </span>
        {isLoading ? (
          "Loading..."
        ) : error ? (
          "Error loading messages."
        ) : (
          <div className="messages">
            {data.map((m) => (
              <motion.div 
                className={m.userId === currentUser._id ? "owner item" : "item"}
                key={m._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt=""
                />
                <p>{m.desc}</p>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        <hr />
        <motion.form 
          className="write" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <textarea type="text" placeholder="Write a message..." />
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default Message;
