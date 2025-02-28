import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/loader/Loader";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const { search } = useLocation();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs"],
    queryFn: () =>
      newRequest
        .get(
          `/gigs${search}&min=${minRef.current.value}&max=${maxRef.current.value}&sort=${sort}`
        )
        .then((res) => res.data),
  });

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort]);

  const apply = () => {
    refetch();
  };

  return (
    <motion.div 
      className="gigs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <motion.span className="breadcrumbs" initial={{ x: -50 }} animate={{ x: 0 }}>
          Fiverr &gt; Gigs
        </motion.span>
        {/* Added optional chaining for safe access to 'data' */}
        <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }}>
          {data?.cat || "Category"} {/* Default to "Category" if undefined */}
        </motion.h1>
        <motion.p initial={{ y: 20 }} animate={{ y: 0 }}>
          Explore the boundaries of art and technology with Fiverr AI artists
        </motion.p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <motion.input 
              ref={minRef} 
              type="number" 
              placeholder="Min" 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileFocus={{ scale: 1.05, borderColor: "#1dbf73" }}
            />
            <motion.input 
              ref={maxRef} 
              type="number" 
              placeholder="Max" 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileFocus={{ scale: 1.05, borderColor: "#1dbf73" }}
            />
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={apply}
            >
              Apply
            </motion.button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">{sort === "sales" ? "Best Selling" : "Newest"}</span>
            <motion.img 
              src="./img/down.png" 
              alt="" 
              onClick={() => setOpen(!open)}
              whileHover={{ rotate: 180 }}
            />
            <AnimatePresence>
              {open && (
                <motion.div 
                  className="rightMenu" 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                  <span onClick={() => reSort("popular")}>Popular</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="cards">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <span>Something went wrong!</span>
          ) : (
            data?.map((gig) => (
              <motion.div key={gig._id} initial={{ scale: 0.9 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }}>
                <GigCard item={gig} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Gigs;
