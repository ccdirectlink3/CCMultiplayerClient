import { Multiplayer } from '../../multiplayer.js';

export class PlayerListener {
    private children: Array<(player: ig.ENTITY.Player) => void> = [];

    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        ig.game.addons.postUpdate.push(this);
    }

    public addChild(child: (player: ig.ENTITY.Player) => void) {
        this.children.push(child);
    }

    public onPostUpdate(): void {
        const player = ig.game.playerEntity;

        if (player && !this.main.loadingMap) {
            for (const child of this.children) {
                child(player);
            }
        }
    }
}
