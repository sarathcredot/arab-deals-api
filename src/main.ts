import express, { Request, Response, NextFunction } from 'express';
import bodyParser from "body-parser";
import path from 'path';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';
import { expressMiddleware } from '@apollo/server/express4';
import { MongoDBConnect, ApolloServerConnect } from './configs';
import { resolvers } from "./resolvers";
import routes from "./routes";
import { ErrorBody } from "./utils";
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { Server } from 'socket.io';



// app creation
const app = express();


//Cors
const corsOptions = {
    origin: [
        process.env.USER_APP_URL || "",
        process.env.ADMIN_APP_URL || "",
        process.env.USER_APP_URL_WWW || ""
    ]
}
// app.use(cors(corsOptions));
app.use(cors());



//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Static public File access
app.use(express.static(path.join(path.dirname(__dirname), 'public')));


// bootstrapping http server
const httpServer = http.createServer(app);


// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: [
            process.env.USER_APP_URL || "",
            process.env.ADMIN_PORTAL_URL || "",
            process.env.USER_APP_URL_WWW || ""
        ], methods: ["GET", "POST"]
        // origin: "*"
    }
});
  

// Handle Socket.io Connection
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

  
    socket.on("message", (data) => {
        console.log("Message received:", data);
        io.emit("message", data);
    });

    // Handle Client Disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});



// Configure mongo connection
const mongoDBConection = new MongoDBConnect();
mongoDBConection.connect();




//starting apolloserver - graphql end point
const startApolloServer = async () => {
    try {
        const apolloServerConnect = new ApolloServerConnect(httpServer, resolvers);

        const { server } = await apolloServerConnect.startApollo();



        app.use("/graphql", graphqlUploadExpress(), expressMiddleware(server, {
            context: async ({ req }) => {
                // console.log("⚡ GraphQL Context Initialized! Socket.io Available:", !!io);
                return { req, io  };
            }
        }));


        // Routing happens here
        routes(app);


        // catch 404 and forward to error handler
        app.use(function (req: Request, res: Response, next: NextFunction) {
            next(new ErrorBody(404, "Not Found", []));
        });


        // error handler
        app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
            console.log("ERROR=====================================> START");
            console.log(err);
            console.log("ERROR=====================================> END");

            res.status(err.status || 500);
            res.setHeader('Content-Type', 'application/json');
            res.json({ message: err.message || "Internal Server Error", error: true, errors: err.errors || [] });
        });


        httpServer.listen(process.env.PORT || 3000, () => {
            console.log("server is running on port ", process.env.PORT);
        })

    } catch (error) {
        console.log(error);
    }
}

startApolloServer();


