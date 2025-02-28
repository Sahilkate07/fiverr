import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Navbar.scss";
import { ToastContainer } from "react-toastify";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const navigate = useNavigate();

  const handleBecomeSeller = async () => {
    try {
      const response = await newRequest.put("/users/become-seller");
      const updatedUser = { 
        ...currentUser, 
        isSeller: true,
        canBeSeller: true
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      toast.success("🎉 You are now a seller!");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <>
      <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
        <div className="container">
          <div className="logo">
            <Link className="link" to="/">
              <span className="text">fiverr</span>
            </Link>
            <span className="dot">.</span>
          </div>
          <div className="links">
            <span>Fiverr Business</span>
            <a href=""><span>Explore</span></a>
            <span>English</span>
            {!currentUser?.isSeller && currentUser?.canBeSeller && (
              <span onClick={handleBecomeSeller} style={{ cursor: "pointer" }}>
                Become a Seller
              </span>
            )}
            {currentUser ? (
              <div
                className={`user ${open ? "open" : ""}`}
                onClick={() => setOpen(!open)}
              >
                <img src={currentUser.img || "/img/noavatar.jpg"} alt="" />
                <span>{currentUser?.username}</span>
                <div className="options">
                  {currentUser.isSeller && (
                    <>
                      <Link
                        className="link"
                        to="/mygigs"
                        onClick={() => setOpen(false)}
                      >
                        Gigs
                      </Link>
                      <Link
                        className="link"
                        to="/add"
                        onClick={() => setOpen(false)}
                      >
                        Add New Gig
                      </Link>
                    </>
                  )}
                  <Link
                    className="link"
                    to="/orders"
                    onClick={() => setOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    className="link"
                    to="/messages"
                    onClick={() => setOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    className="link"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    Logout
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="link">
                  Sign in
                </Link>
                <Link className="link join" to="/register">
                  <button>Join</button>
                </Link>
              </>
            )}
          </div>
        </div>
        {(active || pathname !== "/") && (
          <>
            <hr />
            <div className="menu">
              <Link className="link menuLink" to="/">
                Graphics & Design
              </Link>
              <Link className="link menuLink" to="/">
                Video & Animation
              </Link>
              <Link className="link menuLink" to="/">
                Writing & Translation
              </Link>
              <Link className="link menuLink" to="/">
                AI Services
              </Link>
              <Link className="link menuLink" to="/">
                Digital Marketing
              </Link>
              <Link className="link menuLink" to="/">
                Music & Audio
              </Link>
              <Link className="link menuLink" to="/">
                Programming & Tech
              </Link>
              <Link className="link menuLink" to="/">
                Business
              </Link>
              <Link className="link menuLink" to="/">
                Lifestyle
              </Link>
            </div>
            <hr />
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default Navbar;
