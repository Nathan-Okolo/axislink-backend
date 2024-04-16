// import memberRoutes from "./signUp.js";
import uploadRoute from "../uploads/uploadImg.js";
import authRoute from "./authentication/authRoutes.js";
import postRoute from "./postRoutes/postRoutes.js";
import userRoute from "./userServices/userServicesRoutes.js";

export default (router) => {
  router.use("/auth", authRoute());
  router.use("/profile", userRoute());
  router.use("/post", postRoute());
  router.use("/upload", uploadRoute());

  return router;
};
