import express from 'express';
import { getUsers, createUser } from './database.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const app = express(); 

let sessions = {};

// Middleware to parse JSON requests and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.get("/users", async (req, res) => {
    console.log(req.headers.cookie);
    try {
        let sessionId = req.headers.cookie.split('=')[1];
        console.log(sessionId);
        let user = sessions[sessionId];
        if (!user) {
            res.status(401).send(JSON.stringify({
                message: 'Not logged in'
            }));
            res.end();
            return;
        }
    }
    catch {
        res.status(401).send(JSON.stringify({
            message: 'Not logged in'
        }));
        res.end();
        return;
    }
    console.log('Requested users');
    const users = await getUsers();
    res.send(users);
    res.end();
});

app.post("/user", async (req, res) => {
    console.log(req.headers.cookie);
    try {
        let sessionId = req.headers.cookie.split('=')[1];
        console.log(sessionId);
        let user = sessions[sessionId];
        if (!user) {
            res.status(401).send(JSON.stringify({
                message: 'Not logged in'
            }));
            res.end();
            return;
        }
    }
    catch {
        res.status(401).send(JSON.stringify({
            message: 'Not logged in'
        }));
        res.end();
        return;
    }
    let sessionId = req.headers.cookie.split('=')[1];
    let user = sessions[sessionId];
    let { id, name } = user;
    let accesslvl = user.access;
    res.status(200).send(JSON.stringify({
        id: id,
        name: name,
        accesslvl: accesslvl
    }));
    res.end();
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let [userInDB] = await getUsers(null, email);
    if (!userInDB) {
        res.status(401).send(JSON.stringify({
            message: 'This username does not exist'
        }));
        return;
    }
    let correctPw = await bcrypt.compare(password, userInDB.password);
    if (correctPw) {
        let sessionId = crypto.randomUUID();
        sessions[sessionId] = userInDB;
        console.log(sessions);
        res.cookie('sessionId', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'None', secure: true });
        res.status(200).send(JSON.stringify({
            id: userInDB.id,
            name: userInDB.name,
            email: userInDB.email,
            accesslvl: userInDB.access,
            message: 'Logged in'
        }));
    }
    else {
        res.status(401).send(JSON.stringify({
            message: 'Incorrect login information'
        }));
    }
})

app.post("/signup", async (req, res) => {
    let { name, email, password, accesslvl } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    let id = await createUser(name, email, hashedPassword, accesslvl);
    res.status(201).send({ id: id });
    res.end();
});

app.post("/logout", (req, res) => {
    let sessionId
    try {
        sessionId = req.headers.cookie.split('=')[1]; 
        delete sessions[sessionId];
    }
    catch {
        res.status(401).send(JSON.stringify({
            message: 'Not logged in'
        }));
        return;
    }
    res.clearCookie('sessionId');
    res.status(200).send(JSON.stringify({
        message: 'Logged out'
    }));
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({message: 'Something broke!'})
});

app.listen(8080, () => {
    console.log('listening on port 8080');
});
