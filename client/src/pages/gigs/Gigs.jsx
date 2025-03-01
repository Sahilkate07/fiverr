import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/loader/Loader";
import { FiChevronDown } from "react-icons/fi";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const menuRef = useRef();
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [sort]);

  const apply = () => {
    refetch();
  };

  const sortOptions = [
    { value: "createdAt", label: "Newest" },
    { value: "sales", label: "Best Selling" },
    { value: "popular", label: "Popular" }
  ];

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
        <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }}>
          {data?.cat || "Category"}
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
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={apply}
            >
              Apply
            </motion.button>
          </div>
          <div className="right" ref={menuRef}>
            <span className="sortBy">Sort by</span>
            <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="sortType">
                {sortOptions.find(option => option.value === sort)?.label}
              </span>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown />
              </motion.div>
            </div>
            <AnimatePresence>
              {open && (
                <motion.div 
                  className="rightMenu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {sortOptions.map((option) => (
                    <span
                      key={option.value}
                      onClick={() => reSort(option.value)}
                      style={{
                        backgroundColor: sort === option.value ? '#f0f0f0' : 'transparent'
                      }}
                    >
                      {option.label}
                    </span>
                  ))}
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
              <motion.div 
                key={gig._id} 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                whileHover={{ scale: 1.02 }}
              >
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
