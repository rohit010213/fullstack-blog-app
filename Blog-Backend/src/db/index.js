import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();

const  connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);

            console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        
        }

        catch (error) {
            console.log("MongoDB connection Failed",error)
            process.exit(1);
        }
    }
    
    export default connectDB;