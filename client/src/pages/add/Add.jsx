import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import { motion } from "framer-motion";
import { FiUploadCloud } from "react-icons/fi";
import "./Add.scss";

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Upload cover image
      const cover = await upload(singleFile);
      console.log("Cover image uploaded:", cover);
      
      // Upload additional images
      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          console.log("Additional image uploaded:", url);
          return url;
        })
      );
      
      if (!cover) {
        toast.error("Failed to upload cover image!");
        return;
      }
      
      // Update state with image URLs
      dispatch({ 
        type: "ADD_IMAGES", 
        payload: { 
          cover, 
          images: images.filter(url => url) // Filter out any failed uploads
        } 
      });
      
      console.log("State after upload:", {
        cover,
        images
      });
      
      toast.success("Images uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (gig) => {
      // Ensure images are included in the gig data
      const gigData = {
        ...gig,
        cover: gig.cover,
        images: gig.images || []
      };
      
      console.log("Creating gig with data:", {
        ...gigData,
        cover: gigData.cover ? gigData.cover.substring(0, 50) + '...' : null,
        images: gigData.images?.map(url => url.substring(0, 50) + '...') || []
      });

      return newRequest.post("/gigs", gigData);
    },
    onSuccess: (response) => {
      console.log("Gig created successfully:", response.data);
      queryClient.invalidateQueries(["myGigs"]);
      toast.success("Gig created successfully!");
      navigate("/mygigs");
    },
    onError: (error) => {
      console.error("Failed to create gig:", error);
      toast.error(error.response?.data?.message || "Failed to create gig!");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload cover image
      const cover = await upload(singleFile);
      
      // Upload additional images
      const imageUrls = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );

      // Create gig with uploaded images
      const response = await newRequest.post("/gigs", {
        ...state,
        cover,
        images: imageUrls,
      });

      toast.success("Gig created successfully!");
      navigate(`/gig/${response.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create gig");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("No files selected!");
      return;
    }

    // Validate file types
    const validImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const invalidFiles = Array.from(selectedFiles).filter(
      file => !validImageTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Only JPEG, PNG, JPG, or WEBP files are allowed!");
      return;
    }

    if (type === "single") {
      setSingleFile(selectedFiles[0]);
    } else {
      setFiles(Array.from(selectedFiles));
    }
  };

  return (
    <motion.div 
      className="add"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <h1>Create a New Gig</h1>
        <div className="sections">
          <div className="info">
            <label>Title *</label>
            <input 
              type="text" 
              name="title" 
              placeholder="e.g. I will do something I'm really good at" 
              onChange={handleChange}
              required 
            />
            
            <label>Category *</label>
            <select name="cat" onChange={handleChange} required>
              <option value="">Select a category</option>
              <option value="design">Design</option>
              <option value="web">Web Development</option>
              <option value="animation">Animation</option>
              <option value="music">Music</option>
              <option value="ai">AI Services</option>
              <option value="marketing">Digital Marketing</option>
              <option value="writing">Writing & Translation</option>
              <option value="video">Video & Animation</option>
            </select>

            <label>Cover Image *</label>
            <div className="upload-section">
              <input type="file" onChange={(e) => handleFileChange(e, "single")} required />
              <label>Additional Images</label>
              <input type="file" multiple onChange={(e) => handleFileChange(e, "multiple")} />
              <button 
                className="upload-btn" 
                onClick={handleUpload} 
                disabled={uploading || (!singleFile && !files.length)}
              >
                {uploading ? "Uploading..." : <><FiUploadCloud size={20} /> Upload</>}
              </button>
            </div>

            <label>Description *</label>
            <textarea 
              name="desc" 
              placeholder="Brief description to introduce your service to customers" 
              rows="8"
              onChange={handleChange}
              required
            />
          </div>

          <div className="details">
            <label>Service Title *</label>
            <input 
              type="text" 
              name="shortTitle" 
              placeholder="e.g. One-page web design" 
              onChange={handleChange}
              required 
            />

            <label>Short Description *</label>
            <textarea 
              name="shortDesc" 
              placeholder="Short description of your service" 
              rows="4"
              onChange={handleChange}
              required
            />

            <label>Delivery Time (days) *</label>
            <input 
              type="number" 
              name="deliveryTime" 
              min="1"
              onChange={handleChange}
              required 
            />

            <label>Revision Number *</label>
            <input 
              type="number" 
              name="revisionNumber" 
              min="1"
              onChange={handleChange}
              required 
            />

            <label>Price ($) *</label>
            <input 
              type="number" 
              name="price" 
              min="1"
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        <motion.button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={uploading} 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          {uploading ? "Please wait..." : "Create Gig"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Add;
