import { Multiplayer } from '../../multiplayer.js';

export class PlayerListener {
    private children: Array<(player: ig.ENTITY.Player) => any> = [];

    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        simplify.registerUpdate(() => {
            this.onUpdate(); // Added a lambda to avoid context weirdness
        });
    }

    public addChild(child: (player: ig.ENTITY.Player) => any) {
        this.children.push(child);
    }

    public onUpdate(): void {
        const player = ig.game.playerEntity;

        if (player && !this.main.loadingMap) {
            for (const child of this.children) {
                child(player);
            }
        }
    }
}
