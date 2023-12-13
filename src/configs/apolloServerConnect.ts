import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import { readFileSync } from "fs";
import { Resolvers } from 'src/_generated_/resolvers-types';



export default class ApolloServerConnect {


    constructor(public httpServer: http.Server, public resolvers: Resolvers) { 
    }

    async startApollo(): Promise<{ server: ApolloServer }> {

        try {
            const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8' });

            const server = new ApolloServer(
                {
                    resolvers: this.resolvers,
                    typeDefs,
                    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })],
                },
            );

            await server.start();

            return { server };
        } catch (error) {
            return Promise.reject(error);
        }

    }
}


