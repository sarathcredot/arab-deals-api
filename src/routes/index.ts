import { Express } from 'express';
import { testRouter } from './testRouter';
import { welcomeRouter } from './welcomeRouter';
import { fileRouter } from './fileRouter';


export default (app: Express) => {
    app.use("/", welcomeRouter);
    app.use("/test", testRouter);
    app.use("/file", fileRouter);
}