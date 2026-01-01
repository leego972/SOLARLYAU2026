import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute("SELECT `key`, value, description FROM systemConfig WHERE `key` = 'google_ads_client_account_id'");
console.log('Client Account Config:', JSON.stringify(rows, null, 2));
await connection.end();
