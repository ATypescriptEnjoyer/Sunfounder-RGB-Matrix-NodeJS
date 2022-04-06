import { I2C } from "./i2c";
import { Matrix } from "./matrix";

const i2c = new I2C();
const addresses = i2c.scan();
if(addresses.length === 0) {
    console.error("No I2C addresses found!");
    process.exit(1);
}
const matrix = new Matrix(addresses[0]);

const array = [
    "white","white","white","white","white","white","white","white",
    "white","white","red","white","white","red","white","white",
    "white","white","red","white","white","red","white","white",
    "white","white","red","white","white","red","white","white",
    "red","white","white","white","white","white","white","red",
    "red","red","white","white","white","white","red","red",
    "white","red","red","white","white","red","red","white",
    "white","white","red","red","red","red","white","white"
];

if(array) {
    const colours = matrix.coloursToArray(array);
    if(colours) {
        matrix.writeMap(colours);
    }
}