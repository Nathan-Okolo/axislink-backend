// import memberRoutes from "./signUp.js";
import signUpRoute from "./signUp.js";

export default (router) => {
    router.use('/email', signUpRoute());


    return router;
};