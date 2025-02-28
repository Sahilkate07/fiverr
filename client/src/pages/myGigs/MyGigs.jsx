import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyGigs.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import { FiTrash2, FiExternalLink } from "react-icons/fi";

function MyGigs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userId = user?._id;
  const isSeller = user?.isSeller;

  const queryClient = useQueryClient();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      const response = await newRequest.get("/gigs");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => {
      toast.success("Gig deleted successfully!");
      queryClient.invalidateQueries(["myGigs", userId]);
    },
  });

  const handleDelete = async (id) => {
    try {
      await newRequest.delete(`/gigs/${id}`);
      toast.success("Gig deleted successfully!");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting gig");
    }
  };

  const handleGigClick = (gigId) => {
    navigate(`/gig/${gigId}`);
  };

  const handleImageError = (gig) => {
    toast.error(`Failed to load gig image for "${gig.title}"`);
  };

  return (
    <div className="myGigs">
      <div className="container">
        <div className="title">
          <h1>{isSeller ? "My Gigs" : "My Orders"}</h1>
          {isSeller && (
            <Link to="/add">
              <button>Add New Gig</button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="loading">Loading your gigs...</div>
        ) : error ? (
          <div className="error">Error loading gigs. Please try again later.</div>
        ) : !data?.length ? (
          <div className="no-gigs">
            <p>No gigs found. Create your first gig!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((gig) => (
                <tr key={gig._id}>
                  <td>
                    <div className="image-container" onClick={() => handleGigClick(gig._id)}>
                      <img 
                        className="image" 
                        src={gig.cover} 
                        alt={gig.title}
                        onError={(e) => {
                          handleImageError(gig);
                          e.target.src = "/img/noimage.jpg";
                          e.target.alt = "Cover image not available";
                        }}
                      />
                      <div className="image-overlay">
                        <FiExternalLink />
                        <span>View Gig</span>
                      </div>
                    </div>
                  </td>
                  <td>{gig.title}</td>
                  <td>${gig.price}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(gig._id)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyGigs;
