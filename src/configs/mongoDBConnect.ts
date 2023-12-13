import mongoose from 'mongoose';


export default class MongoDBConnect {

    constructor() { }

    async connect(): Promise<void> {

        try {
            mongoose.set('strictQuery', false);
            await mongoose.connect(process.env.DB_CONNECTION || "");
            console.log('Successfully connected to mongoDB');
        } catch (error) {
            console.log(error);
        }
        
    }
}