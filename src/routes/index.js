// import memberRoutes from "./signUp.js";
import authRoute from "./authentication/authRoutes.js";
import signUpRoute from "./signUp.js";
import userRoute from "./userServices/userServicesRoutes.js";

export default (router) => {
    router.use('/auth', authRoute());
    router.use('/profile', userRoute());
    router.use('/email', signUpRoute());


    return router;
};