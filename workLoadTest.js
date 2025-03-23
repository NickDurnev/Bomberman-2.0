const { io } = require("socket.io-client");
const { v4: uuidv4 } = require("uuid");

const URL = "https://app.bomberman.click";
// const URL = "http://localhost:4000";
const TOTAL_CLIENTS = 12;
const MOVE_INTERVAL_MS = 200;
const BOMB_INTERVAL_MS = 500;
const DURATION_MS = 60000; // Run the test for 30 seconds

const GAMEID = "c4ec72af-c471-45d6-b00f-b5650fb2fecf";

const emails = [
    "nikitaspec1@gmail.com",
    "nikitaspec2@gmail.com",
    "nikitaspec3@gmail.com",
    "nikitaspec4@gmail.com",
    "nikitaspec5@gmail.com",
    "nikitaspec6@gmail.com",
    "nikitaspec7@gmail.com",
    "nikitaspec8@gmail.com",
    "nikitaspec9@gmail.com",
    "nikitaspec10@gmail.com",
    "nikitaspec11@gmail.com",
    "nikitaspec12@gmail.com",
    // "nikitaspec13@gmail.com",
    // "nikitaspec14@gmail.com",
];

const bombsCoordinates = [
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 1, col: 5 },
    { row: 1, col: 6 },
    { row: 1, col: 11 },
    { row: 1, col: 13 },
    { row: 1, col: 15 },
    { row: 1, col: 17 },
    { row: 1, col: 19 },
    { row: 1, col: 21 },
    { row: 1, col: 24 },
    { row: 1, col: 26 },
    { row: 1, col: 28 },
    { row: 2, col: 2 },
    { row: 2, col: 6 },
    { row: 2, col: 8 },
    { row: 2, col: 9 },
    { row: 2, col: 12 },
    { row: 2, col: 14 },
    { row: 2, col: 16 },
    { row: 2, col: 18 },
    { row: 2, col: 20 },
    { row: 2, col: 21 },
    { row: 2, col: 23 },
    { row: 2, col: 24 },
    { row: 2, col: 27 },
    { row: 2, col: 29 },
    { row: 2, col: 30 },
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 3, col: 5 },
    { row: 3, col: 6 },
    { row: 3, col: 7 },
    { row: 3, col: 8 },
    { row: 3, col: 9 },
    { row: 3, col: 13 },
    { row: 3, col: 14 },
    { row: 3, col: 19 },
    { row: 3, col: 20 },
    { row: 3, col: 21 },
    { row: 3, col: 22 },
    { row: 3, col: 23 },
    { row: 3, col: 24 },
    { row: 3, col: 30 },
    { row: 4, col: 5 },
    { row: 4, col: 6 },
    { row: 4, col: 7 },
    { row: 4, col: 8 },
    { row: 4, col: 9 },
    { row: 4, col: 13 },
    { row: 4, col: 14 },
    { row: 4, col: 15 },
    { row: 4, col: 16 },
    { row: 4, col: 17 },
    { row: 4, col: 18 },
    { row: 4, col: 19 },
    { row: 4, col: 20 },
    { row: 4, col: 25 },
    { row: 4, col: 28 },
    { row: 4, col: 30 },
    { row: 5, col: 3 },
    { row: 5, col: 5 },
    { row: 5, col: 6 },
    { row: 5, col: 7 },
    { row: 5, col: 8 },
    { row: 5, col: 9 },
    { row: 5, col: 12 },
    { row: 5, col: 13 },
    { row: 5, col: 14 },
    { row: 5, col: 18 },
    { row: 5, col: 19 },
    { row: 5, col: 25 },
    { row: 5, col: 26 },
    { row: 5, col: 27 },
    { row: 5, col: 28 },
    { row: 5, col: 29 },
    { row: 5, col: 30 },
    { row: 6, col: 3 },
    { row: 6, col: 23 },
    { row: 6, col: 28 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 8 },
    { row: 7, col: 9 },
    { row: 7, col: 17 },
    { row: 7, col: 19 },
    { row: 7, col: 20 },
    { row: 7, col: 21 },
    { row: 7, col: 22 },
    { row: 7, col: 23 },
    { row: 7, col: 26 },
    { row: 7, col: 27 },
    { row: 7, col: 28 },
    { row: 8, col: 5 },
    { row: 8, col: 6 },
    { row: 8, col: 8 },
    { row: 8, col: 13 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 1, col: 5 },
    { row: 1, col: 6 },
    { row: 1, col: 11 },
    { row: 1, col: 13 },
    { row: 1, col: 15 },
    { row: 1, col: 17 },
    { row: 1, col: 19 },
    { row: 1, col: 21 },
    { row: 1, col: 24 },
    { row: 1, col: 26 },
    { row: 1, col: 28 },
    { row: 2, col: 2 },
    { row: 2, col: 6 },
    { row: 2, col: 8 },
    { row: 2, col: 9 },
    { row: 2, col: 12 },
    { row: 2, col: 14 },
    { row: 2, col: 16 },
    { row: 2, col: 18 },
    { row: 2, col: 20 },
    { row: 2, col: 21 },
    { row: 2, col: 23 },
    { row: 2, col: 24 },
    { row: 2, col: 27 },
    { row: 2, col: 29 },
    { row: 2, col: 30 },
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 3, col: 5 },
    { row: 3, col: 6 },
    { row: 3, col: 7 },
    { row: 3, col: 8 },
    { row: 3, col: 9 },
    { row: 3, col: 13 },
    { row: 3, col: 14 },
    { row: 3, col: 19 },
    { row: 3, col: 20 },
    { row: 3, col: 21 },
    { row: 3, col: 22 },
    { row: 3, col: 23 },
    { row: 3, col: 24 },
    { row: 3, col: 30 },
    { row: 4, col: 5 },
    { row: 4, col: 6 },
    { row: 4, col: 7 },
    { row: 4, col: 8 },
    { row: 4, col: 9 },
    { row: 4, col: 13 },
    { row: 4, col: 14 },
    { row: 4, col: 15 },
    { row: 4, col: 16 },
    { row: 4, col: 17 },
    { row: 4, col: 18 },
    { row: 4, col: 19 },
    { row: 4, col: 20 },
    { row: 4, col: 25 },
    { row: 4, col: 28 },
    { row: 4, col: 30 },
    { row: 5, col: 3 },
    { row: 5, col: 5 },
    { row: 5, col: 6 },
    { row: 5, col: 7 },
    { row: 5, col: 8 },
    { row: 5, col: 9 },
    { row: 5, col: 12 },
    { row: 5, col: 13 },
    { row: 5, col: 14 },
    { row: 5, col: 18 },
    { row: 5, col: 19 },
    { row: 5, col: 25 },
    { row: 5, col: 26 },
    { row: 5, col: 27 },
    { row: 5, col: 28 },
    { row: 5, col: 29 },
    { row: 5, col: 30 },
    { row: 6, col: 3 },
    { row: 6, col: 23 },
    { row: 6, col: 28 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 8 },
    { row: 7, col: 9 },
    { row: 7, col: 17 },
    { row: 7, col: 19 },
    { row: 7, col: 20 },
    { row: 7, col: 21 },
    { row: 7, col: 22 },
    { row: 7, col: 23 },
    { row: 7, col: 26 },
    { row: 7, col: 27 },
    { row: 7, col: 28 },
    { row: 8, col: 5 },
    { row: 8, col: 6 },
    { row: 8, col: 8 },
    { row: 8, col: 13 },
];

// Function to generate a random direction for movement
const getRandomDirection = (currentPosition) => {
    // Define movement step size (smaller for smoother movement)
    const STEP_SIZE = 20;

    // Generate random angle between 0 and 2π
    const angle = Math.random() * 2 * Math.PI;

    // Calculate new position based on angle and step size
    const newX = currentPosition.x + Math.cos(angle) * STEP_SIZE;
    const newY = currentPosition.y + Math.sin(angle) * STEP_SIZE;

    // Ensure players stay within bounds (assuming game area is 1000x1000)
    const BOUNDS = {
        minX: 0,
        maxX: 1000,
        minY: 0,
        maxY: 1000,
    };

    return {
        x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, newX)),
        y: Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, newY)),
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
    const socketId = uuidv4();

    let currentPosition = {
        x: 500,
        y: 500,
    };

    let previousPosition = {
        x: 500,
        y: 500,
    };

    let currentBomb = {
        col: 5,
        row: 5,
    };

    // Add movement state
    let isMoving = false;
    let lastMoveTime = Date.now();
    let stuckCounter = 0;
    const STUCK_THRESHOLD = 3; // Number of attempts before considering player stuck
    const MIN_MOVEMENT_DISTANCE = 5; // Minimum distance to consider as movement

    socket.on("connect", () => {
        console.log(`Player ${socketId} connected!`);

        console.log(" clientCount:", clientCount);

        socket.emit(
            "updateUserSocketId",
            { email: emails[index], socket_id: socketId },
            (response) => {
                console.log("Response from server:", response);
            }
        );

        setTimeout(() => {
            socket.emit("enter pending game", GAMEID);
        }, 5000);

        setTimeout(() => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const now = Date.now();
                // Only move if enough time has passed since last move
                if (now - lastMoveTime >= MOVE_INTERVAL_MS) {
                    // Randomly decide if player should move or stop
                    isMoving = Math.random() > 0.3; // 70% chance to move

                    if (isMoving) {
                        // Calculate distance moved since last position
                        const distanceMoved = Math.sqrt(
                            Math.pow(
                                currentPosition.x - previousPosition.x,
                                2
                            ) +
                                Math.pow(
                                    currentPosition.y - previousPosition.y,
                                    2
                                )
                        );

                        // If player hasn't moved significantly, increment stuck counter
                        if (distanceMoved < MIN_MOVEMENT_DISTANCE) {
                            stuckCounter++;
                            if (stuckCounter >= STUCK_THRESHOLD) {
                                // Force a new direction by adding a random offset to current position
                                const randomOffset = {
                                    x: (Math.random() - 0.5) * 100,
                                    y: (Math.random() - 0.5) * 100,
                                };
                                currentPosition = {
                                    x: currentPosition.x + randomOffset.x,
                                    y: currentPosition.y + randomOffset.y,
                                };
                                stuckCounter = 0;
                            }
                        } else {
                            stuckCounter = 0;
                        }

                        // Update previous position before getting new direction
                        previousPosition = { ...currentPosition };

                        // Get new direction
                        currentPosition = getRandomDirection(currentPosition);

                        socket.emit("update player position", {
                            playerId: socketId,
                            gameId: GAMEID,
                            x: currentPosition.x,
                            y: currentPosition.y,
                        });
                    }
                    lastMoveTime = now;
                }
            }, MOVE_INTERVAL_MS);

            const interval2 = setInterval(() => {
                currentBomb = getRandomBombPlacement();
                console.log(" currentBomb:", currentBomb);
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

