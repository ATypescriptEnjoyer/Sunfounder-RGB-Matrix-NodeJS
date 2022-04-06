import { I2C } from "./i2c";
import { Matrix } from "./matrix";

const i2c = new I2C();
const addresses = i2c.scan();
if (addresses.length === 0) {
    console.error("No I2C addresses found!");
    process.exit(1);
}
const matrix = new Matrix(addresses[0]);

const array1 = [
    "black", "black", "black", "black", "black", "black", "black", "black",
    "black", "pink", "pink", "black", "black", "pink", "pink", "black",
    "pink", "black", "black", "pink", "pink", "black", "black", "pink",
    "pink", "black", "black", "black", "black", "black", "black", "pink",
    "black", "pink", "black", "black", "black", "black", "pink", "black",
    "black", "black", "pink", "black", "black", "pink", "black", "black",
    "black", "black", "black", "pink", "pink", "black", "black", "black",
    "black", "black", "black", "black", "black", "black", "black", "black"
];

const array2 = [
    "black", "black", "black", "black", "black", "black", "black", "black",
    "black", "blue", "blue", "black", "black", "blue", "blue", "black",
    "blue", "black", "black", "blue", "blue", "black", "black", "blue",
    "blue", "black", "black", "black", "black", "black", "black", "blue",
    "black", "blue", "black", "black", "black", "black", "blue", "black",
    "black", "black", "blue", "black", "black", "blue", "black", "black",
    "black", "black", "black", "blue", "blue", "black", "black", "black",
    "black", "black", "black", "black", "black", "black", "black", "black"
];

const array3 = [
    "black", "black", "black", "black", "black", "black", "black", "black",
    "black", "white", "white", "black", "black", "white", "white", "black",
    "white", "black", "black", "white", "white", "black", "black", "white",
    "white", "black", "black", "black", "black", "black", "black", "white",
    "black", "white", "black", "black", "black", "black", "white", "black",
    "black", "black", "white", "black", "black", "white", "black", "black",
    "black", "black", "black", "white", "white", "black", "black", "black",
    "black", "black", "black", "black", "black", "black", "black", "black"
]

const c1 = matrix.coloursToArray(array1);
const c2 = matrix.coloursToArray(array2);
const c3 = matrix.coloursToArray(array3);

let activeColour = 1;

const doColour = () => {
    let setter: number[][] = [];
    switch(activeColour) {
        case 1:
        case 5:
            setter = c2 as number[][];
            break;
        case 2:
        case 4:
            setter = c1 as number[][];
            break;
        case 3:
            setter = c3 as number[][];
            break;
    }
    matrix.writeMap(setter as number[][]);
    activeColour = activeColour === 5 ? 1 : activeColour += 1;
}

setInterval(() => doColour(), 800);

//matrix.writeMap(c3 as number[][]);