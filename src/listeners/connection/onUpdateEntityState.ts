import { Multiplayer } from '../../multiplayer.js';

export class OnUpdateEntityStateListener {
    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        this.main.connection.onUpdateEntityState(this.onUpdateEntityState.bind(this));
    }

    public onUpdateEntityState(id: number, state: string): void {
        if (this.main.host || !this.main.entities[id]) {
            return;
        }

        this.main.entities[id].currentState = {protected: state} as unknown as string;
        this.main.entities[id].changeState(state);
    }
}
