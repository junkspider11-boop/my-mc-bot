const mineflayer = require('mineflayer')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// --- CONFIGURATION ---
const settings = {
    host: "mcfleet.net",
    port: 25565,
    username: "hazzplayz123",
    password: "%password%" // Yahan apna password likhein
};

let bot = null;

function startBot() {
    if (bot) return;
    bot = mineflayer.createBot({
        host: settings.host,
        port: settings.port,
        username: settings.username
    });

    bot.on('login', () => {
        io.emit('status', 'Online');
        console.log("Bot Joined!");
        setTimeout(() => {
            bot.chat(`/login ${settings.password}`);
            setTimeout(() => bot.chat('/survival'), 3000);
        }, 5000);
    });

    bot.on('chat', (username, message) => {
        io.emit('message', { username, message });
    });

    bot.on('end', () => {
        bot = null;
        io.emit('status', 'Offline');
        console.log("Bot Left.");
    });

    bot.on('error', (err) => {
        io.emit('message', { username: 'System', message: 'Error: ' + err.message });
        bot = null;
    });
}

function stopBot() {
    if (bot) {
        bot.quit();
        bot = null;
    }
}

// --- DASHBOARD UI ---
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>MC Bot Dashboard</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background: #121212; color: white; font-family: sans-serif; text-align: center; padding: 10px; }
                #chat { height: 300px; background: #000; overflow-y: scroll; padding: 10px; border: 1px solid #333; text-align: left; margin: 10px auto; width: 95%; font-size: 14px; }
                .btn-container { display: flex; justify-content: space-around; margin-bottom: 15px; }
                .btn { padding: 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; width: 45%; font-size: 16px; }
                .on { background: #2ecc71; color: white; }
                .off { background: #e74c3c; color: white; }
                .input-container { display: flex; gap: 5px; width: 95%; margin: auto; }
                input { flex-grow: 1; padding: 12px; background: #222; color: white; border: 1px solid #444; border-radius: 5px; }
                #status-label { color: #f1c40f; font-weight: bold; }
            </style>
        </head>
        <body>
            <h3>MC Bot Controller</h3>
            <p>Status: <span id="status-label">Offline</span></p>
