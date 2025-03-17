const { io } = require("socket.io-client");
const { v4: uuidv4 } = require("uuid");

const URL = "http://localhost:4000";
const TOTAL_CLIENTS = 5;
const MOVE_INTERVAL_MS = 200;
const BOMB_INTERVAL_MS = 500;
const DURATION_MS = 60000; // Run the test for 30 seconds

const GAMEID = "9ba65fbd-cea3-457e-8626-636b446167aa";

const emails = [
    "nikitaspec1@gmail.com",
    "nikitaspec2@gmail.com",
    "nikitaspec3@gmail.com",
    "nikitaspec4@gmail.com",
    "nikitaspec5@gmail.com",
];

const bombsCoordinates = [
    { col: 9, row: 6 },
    { col: 19, row: 7 },
    { col: 25, row: 5 },
    { col: 8, row: 12 },
    { col: 14, row: 12 },
    { col: 23, row: 12 },
    { col: 27, row: 12 },
    { col: 27, row: 15 },
];

// Function to generate a random direction for movement
const getRandomDirection = () => {
    return {
        x: Math.floor(Math.random() * (500 - 400 + 1)) + 400, // Random number between 400 and 500
        y: Math.floor(Math.random() * (500 - 400 + 1)) + 400, // Random number between 400 and 500
    };
};

const getRandomBombPlacement = () => {
    const randomIndex = Math.floor(Math.random() * bombsCoordinates.length);
    return {
        col: bombsCoordinates[randomIndex].col,
        row: bombsCoordinates[randomIndex].row,
    };
};

let clientCount = 0;

// Function to create a new player client
const createClient = (index) => {
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

        console.log(" clientCount:", clientCount);

        // Player updates user socket id
        socket.emit(
            "updateUserSocketId",
            { email: emails[index], socket_id: socketId },
            (response) => {
                console.log("Response from server:", response);
            }
        );

        setTimeout(() => {
            // Player enters pending game
            socket.emit("enter pending game", GAMEID);
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
            }, MOVE_INTERVAL_MS);

            const interval2 = setInterval(() => {
                currentBomb = getRandomBombPlacement();
                // Send bomb event
                socket.emit("create bomb", {
                    playerId: socketId,
                    gameId: GAMEID,
                    col: currentBomb.col,
                    row: currentBomb.row,
                });
            }, BOMB_INTERVAL_MS);
            // Stop sending events after 30 seconds
            setTimeout(() => {
                clearInterval(interval);
                clearInterval(interval2);
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
};

// Start creating clients
for (let i = 0; i < TOTAL_CLIENTS; i++) {
    createClient(i); // Create 10 clients simultaneously
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

