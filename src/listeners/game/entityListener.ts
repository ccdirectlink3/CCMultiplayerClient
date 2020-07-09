import { IMultiplayerEntity } from '../../mpEntity.js';
import { Multiplayer } from '../../multiplayer.js';

export class EntityListener {
    private children: Array<(entity: IMultiplayerEntity) => void> = [];

    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        ig.game.addons.postUpdate.push(this);
    }

    public addChild(child: (entity: IMultiplayerEntity) => void) {
        this.children.push(child);
    }

    public onPostUpdate(): void {
        const entities = ig.game.entities;
        for (let i = 0; i < entities.length; i++) {
            const entity = ig.game.entities[i];
            if (!(entity as IMultiplayerEntity).multiplayerId || !(entity instanceof (ig.ENTITY.Enemy as any))) {
                continue;
            }

            const mEntity = entity as IMultiplayerEntity;
            for (const child of this.children) {
                child(mEntity);
            }
        }
    }
}
