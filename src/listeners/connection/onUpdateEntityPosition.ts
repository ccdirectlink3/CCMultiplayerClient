import { Multiplayer } from '../../multiplayer.js';

export class OnUpdateEntityPositionListener {
    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        this.main.connection.onUpdateEntityPosition(this.onUpdateEntityPosition.bind(this));
    }

    public onUpdateEntityPosition(id: number, pos: Vec3): void {
        if (this.main.host || !this.main.entities[id]) {
            return;
        }

        this.main.copyEntityPosition(pos, this.main.entities[id].coll.pos);
    }
}
