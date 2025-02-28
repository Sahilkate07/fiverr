import axios from "axios";

const upload = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("❌ Cloudinary credentials are missing! Check your .env file.");
    return null;
  }

  if (!file) {
    console.error("❌ No file selected for upload.");
    return null;
  }

  // ✅ Validate file type (Only images allowed)
  const validImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validImageTypes.includes(file.type)) {
    console.error("❌ Invalid file type. Only JPEG, PNG, JPG, or WEBP are allowed.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );

    console.log("✅ Cloudinary Upload Success:", response.data.secure_url);
    return response.data.secure_url; // ✅ Return Cloudinary image URL
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.response?.data || error.message);
    return null;
  }
};

export default upload;
