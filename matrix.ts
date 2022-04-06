import { I2C } from "./i2c";
import * as consts from "./constants";

class Matrix {
    private size = [8,8];
    private flag = true;
    private bus: I2C;
    private address;

    constructor(address: number) {
        this.bus = new I2C();
        this.address = parseInt(`0x${address}`);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FUNCTION_PAGE);
        this.writeCommand(consts.SW_SHUT_DOWN_REG, 0x0);
        this.writeCommand(consts.PICTURE_DISPLAY_REG, 0x10);
        this.writeCommand(consts.STAGGERED_DELAY_REG, ((consts.MSKSTD4 & consts.CONST_STD_GROUP4)|(consts.MSKSTD3 & consts.CONST_STD_GROUP3)|(consts.MSKSTD2 & consts.CONST_STD_GROUP2)|(consts.MSKSTD1 & consts.CONST_STD_GROUP1)));
        this.writeCommand(consts.SLEW_RATE_CTL_REG, 0x1);
        this.writeCommand(consts.VAF_CTL_REG, (consts.MSKVAF2 | consts.MSKVAF1));
        this.writeCommand(consts.VAF_CTL_REG2, (consts.MSKFORCEVAFCTL_DISABLE | consts.MSKFORCEVAFTIME_CONST | consts.MSKVAF3));
        this.writeCommand(consts.CURRENT_CTL_REG, (consts.MSKCURRENT_CTL_EN | consts.CONST_CURRENT_STEP_20mA));
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME1_PAGE);
        this.writeCommandArray(0x00, 0X00, 0XB3);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME2_PAGE);
        this.writeCommandArray(0x00, 0X00, 0XB3);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.LED_VAF_PAGE);
        this.writeCommandArray(0X00, consts.Type3Vaf, 0X40);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FUNCTION_PAGE);
        this.writeCommand(consts.SW_SHUT_DOWN_REG, 0x1);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME1_PAGE);
        this.writeCommandArray(0X00, 0XFF, 0X10);
        this.writeCommandArray(0x20, 0x00, 0X80);
        this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME2_PAGE);
        this.writeCommandArray(0X00, 0XFF, 0X10);
        this.writeCommandArray(0x20, 0x00, 0X80);
    }

    private writeCommand = (command: number, data: number): void => {
        this.bus.writeByteData(this.address, command, data);
    }

    private writeCommandArray = (startAddress: number, data: number | number[], length: number): void => {
        let address = startAddress;
        if(typeof data === 'number') {
            [...Array(length).keys()].forEach(() => {
                this.writeCommand(address, data);
                address += 1;
            });
        }
        else if(Array.isArray(data)) {
            [...Array(length).keys()].forEach(i => {
                this.writeCommand(address, data[i]);
                address += 1;
            });
        }
    }

    public coloursToArray = (colours: string[]): number[][] | null => {
        if(!colours) return null;
        return colours.map((colour) => {
            switch(colour) {
                case "red":
                    return [255,0,0];
                case "green":
                    return [0,255,0];
                case "blue":
                    return [0,0,255];
                case "white":
                    return [255,255,255];
                case "black":
                    return [0,0,0];
                default:
                    return [0,0,0];
            }
        })
    }

    public writeMap = (image: number[][]) => {
        image = image.reverse();
        const reds = image.map((numArr) => numArr[0]);
        const greens = image.map((numArr) => numArr[1]);
        const blues = image.map((numArr) => numArr[2]);

        const newImage = [greens, blues, reds];

        let reg = 0x20;
        let empty = 0;
        let position = 0;

        [...Array(15).keys()].forEach(i => {
            if(i == 0) {
                this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME1_PAGE);
            }
            else if(reg === 0x20) {
                this.writeCommand(consts.CONFIGURE_CMD_PAGE, consts.FRAME2_PAGE);
            }
            const colour = i % 3;
            const data = newImage[colour].slice(position * 14, (position + 1) * 14);
            data.splice(empty, 0, 0);
            data.splice(empty + 1, 0, 0);
            this.bus.writeI2CBlockData(this.address, reg, Buffer.from(data));
            if(colour === 2) {
                empty += 3;
                position += 1;
            }
            reg += 0x10;
            if(reg === 0xA0) {
                reg = 0x20;
            }
        });
    }
}

export { Matrix };