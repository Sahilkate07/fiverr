import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiClock, FiRefreshCcw, FiCheck, FiUser, FiStar } from "react-icons/fi";

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();

  // First query to fetch gig data
  const { 
    isLoading: isLoadingGig, 
    error: gigError, 
    data: gigData 
  } = useQuery({
    queryKey: ["gig", id],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/gigs/single/${id}`);
        return res.data;
      } catch (err) {
        toast.error("Failed to load gig details");
        throw err;
      }
    },
    retry: 1
  });

  // Second query to fetch user data, dependent on gigData
  const {
    isLoading: isLoadingUser,
    error: userError,
    data: userData
  } = useQuery({
    queryKey: ["user", gigData?.userId],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/users/${gigData.userId}`);
        return res.data;
      } catch (err) {
        return {
          username: "Anonymous Seller",
          img: "/img/noavatar.jpg"
        };
      }
    },
    enabled: !!gigData?.userId,
    retry: 1
  });

  // Check if current user is the seller
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isOwnGig = currentUser && currentUser._id === gigData?.userId;

  const handleContinueClick = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      toast.error("Please log in first to proceed with the payment!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      
      // Save current page for redirect after login
      localStorage.setItem("redirectAfterLogin", `/gig/${id}`);
      navigate("/login");
      return;
    }

    // Check if the current user is the seller of this gig
    if (currentUser._id === gigData.userId) {
      toast.error("You cannot purchase your own gig!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
      return;
    }

    // Store gig data for payment page
    try {
      localStorage.setItem("gigId", id);
      localStorage.setItem("gigData", JSON.stringify({
        title: gigData.title,
        price: gigData.price,
        sellerId: gigData.userId,
        buyerId: currentUser._id,
        img: gigData.cover
      }));
      
      // Navigate to payment page
      navigate(`/pay/${id}`);
    } catch (err) {
      console.error("Error preparing payment data:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleImageError = (index) => {
    toast.error(`Failed to load image ${index + 1}`);
  };

  // Show loading state while either gig or user data is loading
  if (isLoadingGig || isLoadingUser) {
    return <div className="loading">Loading...</div>;
  }

  // Handle gig fetch error
  if (gigError || !gigData) {
    return (
      <div className="error-container">
        <h2>Failed to load gig</h2>
        <p>This gig might have been removed or is not available.</p>
        <button onClick={() => navigate("/gigs")}>Browse Other Gigs</button>
      </div>
    );
  }

  // Get user data with fallback values
  const seller = {
    username: userData?.username || "Anonymous Seller",
    img: userData?.img || "/img/noavatar.jpg",
    rating: !isNaN(gigData.totalStars / gigData.starNumber) && gigData.starNumber > 0
      ? Math.round(gigData.totalStars / gigData.starNumber)
      : "New"
  };

  return (
    <div className="gig">
      <div className="container">
        <div className="left">
          <div className="breadcrumbs">
            <Link to="/gigs">Gigs</Link> / {gigData.cat || "Uncategorized"}
          </div>
          
          <h1>{gigData.title}</h1>
          
          <div className="user-info">
            <div className="user">
              <img 
                src={seller.img} 
                alt={seller.username} 
                className="user-avatar"
              />
              <div className="user-details">
                <h4>{seller.username}</h4>
                <div className="rating">
                  <FiStar className="star-icon" />
                  <span>{seller.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="slider-container">
            {gigData.cover ? (
              <Slider slidesToShow={1} arrowsScroll={1} className="slider" dots>
                <img 
                  src={gigData.cover} 
                  alt={`${gigData.title} - Cover`}
                  onError={(e) => {
                    console.error("Failed to load cover image:", e.target.src);
                    e.target.src = "/img/noimage.jpg";
                    e.target.alt = "Cover image not available";
                  }}
                />
                {gigData.images && Array.isArray(gigData.images) && gigData.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`${gigData.title} - Image ${index + 1}`}
                    onError={(e) => {
                      console.error(`Failed to load image ${index}:`, e.target.src);
                      e.target.src = "/img/noimage.jpg";
                      e.target.alt = "Image not available";
                    }}
                  />
                ))}
              </Slider>
            ) : (
              <div className="no-images">
                <img src="/img/noimage.jpg" alt="No image available" />
                <p>No images available for this gig</p>
              </div>
            )}
          </div>

          <div className="description">
            <h2>About This Gig</h2>
            <p>{gigData.desc || "No description available"}</p>
          </div>

          <div className="seller-info">
            <h2>About The Seller</h2>
            <div className="user">
              <img 
                src={seller.img} 
                alt={seller.username}
              />
              <div className="info">
                <h3>{seller.username}</h3>
                <div className="rating">
                  <FiStar className="star-icon" />
                  <span>{seller.rating}</span>
                </div>
                <button onClick={handleContinueClick}>Contact Me</button>
              </div>
            </div>
          </div>

          <Reviews gigId={id} />
        </div>

        <div className="right">
          <div className="price-card">
            <div className="header">
              <h3>Gig Package</h3>
              <h2>${gigData.price}</h2>
            </div>
            
            <p className="description">{gigData.shortDesc || "No short description available"}</p>

            <div className="details">
              <div className="item">
                <FiClock className="icon" />
                <span>{gigData.deliveryTime || 0} Days Delivery</span>
              </div>
              <div className="item">
                <FiRefreshCcw className="icon" />
                <span>{gigData.revisionNumber || 0} Revisions</span>
              </div>
            </div>

            <div className="features">
              {gigData.features?.map((feature, index) => (
                <div key={index} className="item">
                  <FiCheck className="icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className="continue-button" 
              onClick={handleContinueClick}
              disabled={isOwnGig}
              style={{
                backgroundColor: isOwnGig ? '#e4e5e7' : '#1dbf73',
                cursor: isOwnGig ? 'not-allowed' : 'pointer'
              }}
              title={isOwnGig ? "You cannot purchase your own gig" : "Continue to purchase"}
            >
              {isOwnGig ? "Your Own Gig" : "Continue"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default Gig;
