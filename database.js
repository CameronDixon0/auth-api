import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function getUsers(id=null, email=null) {
    if (id) {
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
        return rows;
    }
    if (email) {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows;
    }
    
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}

export async function createUser(name, email, password, accesslvl) {
    const [rows] = await pool.query(
        "INSERT INTO users (name, email, password, access) VALUES (?, ?, ?, ?)",
        [name, email, password, accesslvl]
    );
    return rows.insertId;
}