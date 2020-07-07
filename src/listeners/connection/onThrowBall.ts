import { IBallInfo } from '../../ballInfo';
import { Multiplayer } from '../../multiplayer';

const tmpDirectionVec = Vec2.createC();
const tmpPositionVec = Vec3.createC();

export class OnThrownBallListener {
    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        this.main.connection.onThrowBall(this.onThrowBall.bind(this));
    }

    public onThrowBall(ballInfo: IBallInfo): void {
        if (ballInfo.combatant === null) {
            return;
        }

        const entity = this.resolveEntity(ballInfo.combatant);
        if (!entity) {
            return;
        }

        this.shootProxy(entity as sc.BasicCombatant, ballInfo.ballInfo, ballInfo.dir);

    }

    private shootProxy(combatant: sc.BasicCombatant, proxySrc: string, dir: Vec2): void {
        const proxy = sc.ProxyTools.getProxy(proxySrc, combatant);
        if (!proxy) {
            return;
        }

        Vec2.assign(tmpDirectionVec, dir);
        const { x, y, z } = combatant.getAlignedPos(ig.ENTITY_ALIGN.FACE, tmpPositionVec);
        proxy.spawn(x, y, z, combatant, dir);
    }

    private resolveEntity(combatant: number | string | undefined): ig.Entity | undefined {
        if (combatant === undefined) {
            return ig.game.playerEntity;
        }

        if (typeof combatant === 'string') {
            const player = this.main.players[combatant];
            if (!player) {
                return;
            }

            return player.entity;
        }

        if (typeof combatant === 'number') {
            return this.main.entities[combatant];
        }

        throw new Error('Malformed data in ballInfo.combatant received!');
    }
}
