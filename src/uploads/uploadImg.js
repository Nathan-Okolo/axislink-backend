import express from "express";
import { upload } from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";
const uploadServiceRoutes = express.Router();

const uploadRoute = () => {
  uploadServiceRoutes.post("/", upload.single("image"), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Error",
        });
      }

      res.status(200).json({
        success: true,
        message: "Uploaded!",
        data: result.secure_url,
      });
    });
  });

  return uploadServiceRoutes;
};

export default uploadRoute;
