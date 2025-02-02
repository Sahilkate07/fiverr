import axios from 'axios';

const upload = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = 'fiverr'; // Make sure this is set correctly

  if (!CLOUD_NAME) {
    console.error("Cloudinary cloud name is missing!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
  }
};

export default upload;
