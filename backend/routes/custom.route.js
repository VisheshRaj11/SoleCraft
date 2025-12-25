import express from "express";
import upload from "../middleWares/multer.js";
import { CustomShoes } from "../models/customise.model.js";

export const customRouter = express.Router();

customRouter.post("/ping", (req, res) => {
  res.json({ success: true, message: "POST route working" });
});


customRouter.post(
  "/save-design",
  upload.single("image"), // image from frontend
  async (req, res) => {
    try {
      // 🔐 Auth check
    //   if (!req.user) {
    //     return res.status(401).json({
    //       success: false,
    //       message: "Unauthorized"
    //     });
    //   }

      const { name, price, rating } = req.body;

      // ✅ Validation
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image is required"
        });
      }

      // ✅ Save to DB (Cloudinary URL)
      const product = await CustomShoes.create({
        name,
        price,
        rating: rating || 0,
        image: req.file.path // 🔥 Cloudinary image URL
      });

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);

customRouter.get("/get-shoes", async (req, res) => {
  try {
    const shoes = await CustomShoes.find();

    res.status(200).json({
      success: true,
      count: shoes.length,
      data: shoes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

