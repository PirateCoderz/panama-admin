// import mongoose from "mongoose";


// const connectDb = async () => {

//     try {
//         await mongoose.connect(process.env.URI);
//         console.log("Successfully connected to MongoDB Atlas!");
//     } catch (error) {
//         console.error("Failed to connect to MongoDB Atlas:", error);

//         throw error;
//     }
// };

// export default connectDb;


import mysql from "mysql2/promise";

export async function getDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'panama',
    });
    return connection;
}
