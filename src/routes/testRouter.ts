import { NextFunction, Router, Request, Response } from "express";
import { ErrorBody, ResponseBody, responseHandler } from "../utils";


const router = Router();


router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {

        let responseBody = new ResponseBody("Welcome to test routing", false, {
            status: "Success",
        });

        responseHandler(res, next, responseBody);
    } catch (error: any) {
        console.log(error);
        next([400, 401, 403].includes(error.status) ? error : {});
    }
});



export { router as testRouter };
