import { Multiplayer } from '../../multiplayer';

export class OnUpdateAnimationListener {
    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        this.main.connection.onUpdateAnimation(this.onUpdateAnimation.bind(this));
    }

    public onUpdateAnimation(player: string, face: Vec2, anim: string): void {
        const pl = this.main.players[player];
        if (pl && pl.entity) {
            pl.entity.face.x = face.x;
            pl.entity.face.y = face.y;
            pl.entity.currentAnim = anim;
            this.clearAnimation(pl.entity);
            this.playAnimation(pl.entity, anim);
        }
    }

    private clearAnimation(entity: ig.ActorEntity): void {
        entity.animationFixed = false;
    }

    private playAnimation(entity: ig.ActorEntity, anim: string): void {
        entity.setAction([
            { type: 'SHOW_ANIMATION', anim },
            { type: 'WAIT', time: -1 },
        ]);
    }
}
