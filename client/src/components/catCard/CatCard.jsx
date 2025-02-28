import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./CatCard.scss";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
    overflow: "hidden",
  }),
};

function CatCard({ card, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index} // Pass index to control delay for stagger effect
      whileHover={{ scale: 1.05 }} // Hover effect to slightly enlarge card
    >
      <Link to={`/gigs?cat=${card.cat}`}>
        <div className="catCard">
          <img src={card.img} alt="" />
          <span className="desc">{card.desc}</span>
          <span className="title">{card.title}</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default CatCard;
