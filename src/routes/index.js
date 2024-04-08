// import memberRoutes from "./signUp.js";
import authRoute from "./authentication/authRoutes.js";
import signUpRoute from "./signUp.js";

export default (router) => {
    router.use('/auth', authRoute());
    router.use('/email', signUpRoute());


    return router;
};