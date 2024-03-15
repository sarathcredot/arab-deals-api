import { NextFunction, Router, Request, Response } from "express";
import { ErrorBody, ResponseBody, responseHandler } from "../utils";
import { query, validationResult } from 'express-validator';
import { jwtService } from "../services";
import path from "path";

const FILES_FOLDER = path.join(path.dirname(path.dirname(__dirname)));

const router = Router();

router.get("/",
    [
        query("token").optional({ checkFalsy: true })
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ErrorBody(400, "Bad Inputs", errors.array());
            }
            let { token } = req.query;
            let decoded = await jwtService.verifyFileDownloadJWT(token as string);
            if (!decoded || !decoded.filePath) {
                throw new ErrorBody(400, "Bad Inputs", []);
            }

            const filePath = path.join(FILES_FOLDER, decoded.filePath);
            
            return res.download(filePath);

        } catch (error: any) {
            console.log(error);
            next([400, 401, 403].includes(error.status) ? error : {});
        }
    });



export { router as fileRouter };