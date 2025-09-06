// // /src/lib/mysql.js
// import mysql from 'mysql2/promise';

// // const  DB_HOST = "92.205.172.11", 
// // DB_PORT = "3306", 
// // DB_USER = "rootweb", 
// // DB_PASS = "innoHorizon!!2121", 
// // DB_NAME = "panama";

// const DB_HOST = "127.0.0.1",
//   DB_PORT = "3306",
//   DB_USER = "root",
//   DB_PASS = "",
//   DB_NAME = "panama";

// // const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

// const globalForMysql = globalThis;

// export const mysqlPool =
//   globalForMysql.mysqlPool ||
//   mysql.createPool({
//     host: DB_HOST || '127.0.0.1',
//     port: Number(DB_PORT || 3306),
//     user: DB_USER,
//     password: DB_PASS,
//     database: DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     supportBigNumbers: true,
//     dateStrings: true,
//     // If your provider requires SSL, uncomment:
//     // ssl: { rejectUnauthorized: true },
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForMysql.mysqlPool = mysqlPool;
// }

// export default mysqlPool;


// /src/lib/mysql.js
import mysql from "mysql2/promise";

// const DB_HOST = process.env.DB_HOST || "127.0.0.1";
// const DB_PORT = process.env.DB_PORT || "3306";
// const DB_USER = process.env.DB_USER || "root";
// const DB_PASS = process.env.DB_PASS || "";
// const DB_NAME = process.env.DB_NAME || "panama";
const DB_HOST = "127.0.0.1";
const DB_PORT = "3306";
const DB_USER = "root";
const DB_PASS = "";
const DB_NAME = "panama";

const globalForMysql = globalThis;

export const mysqlPool =
  globalForMysql.mysqlPool ||
  mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,
    dateStrings: true,
    // ssl: { rejectUnauthorized: true }, // enable if required by your hosting
  });

// if (process.env.NODE_ENV !== "production") {
globalForMysql.mysqlPool = mysqlPool;
// }

// Small helper
// export async function query(sql, params) {
//   const [rows] = await mysqlPool.execute(sql, params);
//   return rows;
// }

export default mysqlPool;
