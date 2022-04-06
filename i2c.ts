import i2cBus, { I2CBus } from "i2c-bus";
import { execSync } from "child_process";

class I2C {
    readonly MASTER = 0;
    readonly SLAVE = 1;
    readonly RETRY = 5;

    private busId = 1;
    private i2cbus: I2CBus;

    constructor() {
        this.i2cbus = i2cBus.openSync(this.busId);
    }

    public writeByteData = (address: number, command: number, data: number): void => {
        this.i2cbus.writeByteSync(address, command, data);
    }

    public writeWordData = (address: number, command: number, word: number): void => {
        this.i2cbus.writeWordSync(address, command, word);
    }

    public writeI2CBlockData = (address: number, command: number, buffer: Buffer): number => {
        return this.i2cbus.writeI2cBlockSync(address, command, buffer.byteLength, buffer);
    }

    public readByteData = (address: number, command: number): number => {
        return this.i2cbus.readByteSync(address, command);
    }

    public readI2CBlockData = (address: number, command: number, buffer: Buffer): number => {
        return this.i2cbus.readI2cBlockSync(address, command, buffer.byteLength, buffer);
    }

    public scan = (): number[] => {
        return execSync(`i2cdetect -y ${this.busId}`).toString().split("\n").slice(1).reduce((prev, curr) => {
            const intValues = curr.split(" ").slice(1).filter((value) => parseInt(value)).map((value) => parseInt(value));
            return [...prev, ...intValues];
        }, [] as number[])
    }
}

export { I2C };