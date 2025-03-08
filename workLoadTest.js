const { io } = require("socket.io-client");
const { v4: uuidv4 } = require("uuid");

const URL = "https://app.bomberman.click";
const TOTAL_CLIENTS = 5; // 10 players
const EVENTS_INTERVAL_MS = 100; // Send events every 500ms
const DURATION_MS = 30000; // Run the test for 30 seconds

const GAMEID = "440db4dd-b953-4e3b-843d-81676f59d91f";

const emails = [
    "nikitaspec1@gmail.com",
    "nikitaspec2@gmail.com",
    "nikitaspec3@gmail.com",
    "nikitaspec4@gmail.com",
    "nikitaspec5@gmail.com",
];

// Function to generate a random direction for movement
const getRandomDirection = () => {
    return {
        x: Math.floor(Math.random() * (500 - 400 + 1)) + 400, // Random number between 400 and 500
        y: Math.floor(Math.random() * (500 - 400 + 1)) + 400, // Random number between 400 and 500
    };
};

const getRandomBombPlacement = () => {
    return {
        col: Math.floor(Math.random() * 10) - 5,
        row: Math.floor(Math.random() * 10) - 5,
    };
};

let clientCount = 0;

// Function to create a new player client
const createClient = () => {
    const socket = io(URL, { transports: ["websocket"] });
    const socketId = uuidv4(); // Generate playerId

    let currentPosition = {
        x: 500,
        y: 500,
    };

    let currentBomb = {
        col: 5,
        row: 5,
    };

    socket.on("connect", () => {
        console.log(`Player ${socketId} connected!`);

        // Player updates user socket id
        socket.emit(
            "updateUserSocketId",
            { email: emails[clientCount], socket_id: socketId },
            (response) => {
                console.log("Response from server:", response);
            }
        );

        setTimeout(() => {
            // Player enters pending game
            socket.emit("enter pending game", { gameId: GAMEID });
        }, 5000);

        // Start sending position and bomb events every 500ms for 30 seconds
        setTimeout(() => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                currentPosition = getRandomDirection();
                // Send player position update
                socket.emit("update player position", {
                    playerId: socketId,
                    gameId: GAMEID,
                    x: currentPosition.x,
                    y: currentPosition.y,
                });

                currentBomb = getRandomBombPlacement();

                // Send bomb event
                // socket.emit("create bomb", {
                //     playerId: socketId,
                //     gameId: GAMEID,
                //     col: currentBomb.col,
                //     row: currentBomb.row,
                // });

                console.log(`Player ${socketId} sent position & bomb!`);
            }, EVENTS_INTERVAL_MS);
            // Stop sending events after 30 seconds
            setTimeout(() => {
                clearInterval(interval);
                console.log(
                    `Player ${socketId} stopped sending events after 30 seconds.`
                );
                socket.disconnect(); // Disconnect the player after 30 seconds
            }, DURATION_MS);
        }, 10000);
    });

    socket.on("disconnect", (reason) => {
        console.log(`Player disconnected due to ${reason}`);
    });

    clientCount++;

    // Keep creating clients until reaching TOTAL_CLIENTS
    if (clientCount < TOTAL_CLIENTS) {
        createClient(); // No delay between client creations
    }
};

// Start creating clients
for (let i = 0; i < TOTAL_CLIENTS; i++) {
    createClient(); // Create 10 clients simultaneously
}

let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const printReport = () => {
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;
    const packetsPerSecond = (
        packetsSinceLastReport / durationSinceLastReport
    ).toFixed(2);

    console.log(
        `Client count: ${clientCount} ; Average packets received per second: ${packetsPerSecond}`
    );

    packetsSinceLastReport = 0;
    lastReport = now;
};

setInterval(printReport, 5000);

