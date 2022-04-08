import { I2C } from "./i2c";
import { Matrix } from "./matrix";
import { emitKeypressEvents } from "readline";
import _ from "underscore";

const i2c = new I2C();
const addresses = i2c.scan();
if (addresses.length === 0) {
    console.error("No I2C addresses found!");
    process.exit(1);
}

const matrix = new Matrix(addresses[0]);

let gameId: NodeJS.Timeout | null = null;

emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

let snakeCells: number[][] = [];
let appleLocation: number[] = [];
let currentDirection = "right";
let newDirection = "right";
let headCell = [0, 0];

const resetGame = () => {
    gameId && clearInterval(gameId);
    snakeCells = [];
    appleLocation = [];
    headCell = [0,0];
    newDirection = "right";
    currentDirection = "right";
}

process.stdin.on('keypress', (_, key) => {
    console.log(key.name);
    if (["up", "down", "left", "right"].includes(key.name)) {
        newDirection = key.name;
    }
    else if (key.name === "q") {
        const writeableMap = convertMapToColours(returnEmptyMap());
        matrix.writeMap(writeableMap as number[][]);
        process.exit(0);
    }
    else if (key.name === "p") {
        if (gameId) {
            resetGame();
        }
        gameId = setInterval(() => {
            const generatedMap = moveSnake();
            if (generatedMap.status === "dead") {
                if (gameId) {
                    clearInterval(gameId);
                }
            }
            const writeableMap = convertMapToColours(generatedMap.map);
            matrix.writeMap(writeableMap as number[][]);
        }, 200);
    }
})

const returnEmptyMap = (): number[][] => {
    return [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ]
}

const convertMapToColours = (map: number[][]): number[][] => {
    let returnedMap: number[][] = [];
    map.map((row) => {
        row.map((cell) => {
            let rgbArray: number[] = [];
            switch (cell) {
                case 0:
                    rgbArray = [0, 0, 0];
                    break;
                case 1:
                    rgbArray = [255, 255, 255];
                    break;
                case 2:
                    rgbArray = [255, 0, 0];
                    break;
                case 3:
                    rgbArray = [0, 255, 0];
            }
            returnedMap = [...returnedMap, rgbArray];
        });
    });
    return returnedMap;
}

const killGame = () => {
    return [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ];
}

const generateAppleLocation = (currentMap: number[][]): number[] => {
    let possibleSlots: number[][] = [];
    for (let i = 0; i < currentMap.length; i++) {
        for (let j = 0; j < currentMap[i].length; j++) {
            if (currentMap[i][j] === 0) {
                possibleSlots = [...possibleSlots, [i, j]];
            }
        }
    }
    if (possibleSlots.length !== 0) {
        return _.sample(possibleSlots) as number[];
    }
    return [-1, -1];
}

const calculateLocation = (currentCellLocation: number[], direction: string) => {
    let returnedDirection: number[] = currentCellLocation;
    switch (direction) {
        case "right":
            returnedDirection = [returnedDirection[0], returnedDirection[1] + 1];
            break;
        case "left":
            returnedDirection = [returnedDirection[0], returnedDirection[1] - 1];
            break;
        case "up":
            returnedDirection = [returnedDirection[0] - 1, returnedDirection[1]];
            break;
        case "down":
            returnedDirection = [returnedDirection[0] + 1, returnedDirection[1]];
            break;
    }
    return returnedDirection;

}

const moveSnake = (): { status: string, map: number[][] } => {
    const currentSnakeMap = returnEmptyMap();
    if (
        (currentDirection === "left" && newDirection !== "right") ||
        (currentDirection === "right" && newDirection !== "left") ||
        (currentDirection === "up" && newDirection !== "down") ||
        (currentDirection === "down" && newDirection !== "up")
    ) {
        currentDirection = newDirection;
    }
    const newLocation = calculateLocation(headCell, currentDirection);
    let willEatApple = false;
    if (newLocation[0] === appleLocation[0] && newLocation[1] === appleLocation[1]) {
        willEatApple = true;
        snakeCells = [newLocation, ...snakeCells];
    }
    else {
        snakeCells = [newLocation, ...snakeCells.slice(0, -1)];
    }
    const hasEatenSelf = snakeCells.filter((part) => part[0] === snakeCells[0][0] && part[1] === snakeCells[0][1]).length > 1;
    if (newLocation[0] > 7 || newLocation[1] > 7 || newLocation[0] < 0 || newLocation[1] < 0 || hasEatenSelf) {
        return { status: "dead", map: killGame() };
    }
    snakeCells.forEach((element, index) => {
        currentSnakeMap[element[0]][element[1]] = index === 0 ? 3 : 1;
    });
    if (willEatApple || appleLocation.length === 0) {
        appleLocation = generateAppleLocation(currentSnakeMap);
    }
    currentSnakeMap[appleLocation[0]][appleLocation[1]] = 2;
    headCell = newLocation;
    return { status: "alive", map: currentSnakeMap };
}


