import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Featured.scss";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (input.trim() !== "") {
      navigate(`/gigs?search=${input}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (category) => {
    setInput(category);
    navigate(`/gigs?search=${category}`);
  };

  return (
    <motion.div 
      className="featured"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="container">
        {/* Left Section */}
        <motion.div
          className="left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Find the perfect <span>freelance</span> services for your business
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            className="search"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="searchInput">
              <img src="./img/search.png" alt="" />
              <input
                type="text"
                placeholder='Try "building a mobile app"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ color: "black" }}
              />
            </div>
            <motion.button
              onClick={handleSearch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </motion.div>

          {/* Popular Categories */}
          <motion.div
            className="popular"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span>Popular:</span>
            {["Web Design", "WordPress", "Logo Design", "AI Services"].map(
              (category) => (
                <motion.button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.9 }}
                >
                  {category}
                </motion.button>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Right Section (Image) */}
        <motion.div
          className="right"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src="./img/man.png"
            alt=""
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Featured;
