import { Multiplayer } from '../../multiplayer.js';

export class OnTeleportListener {

    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        ig.game.addons.teleport.push(this);
    }

    public onTeleport(map: string, teleportPosition?: ig.TeleportPosition | null): void {
        this.main.loadingMap = true;
        this.main.connection.changeMap(
            map,
            (teleportPosition && teleportPosition.marker) || null,
        );
    }
}
