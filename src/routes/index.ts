import { Express } from 'express';
import { testRouter } from './testRouter';
import { welcomeRouter } from './welcomeRouter';


export default (app: Express) => {
    app.use("/", welcomeRouter);
    app.use("/test", testRouter);
}