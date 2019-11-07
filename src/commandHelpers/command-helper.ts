import { BaseCommand } from "../baseCommand";

export class CommandHelper<T extends BaseCommand> {
    public cmd: T;

    constructor(cmd: T) {
        this.cmd = cmd;
    }
}
