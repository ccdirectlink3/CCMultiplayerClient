import { Multiplayer } from '../../multiplayer.js';

interface MapData {
    entities: Array<{
        type: string;
        settings: any;
    }>;
}

export class OnMapEnterListener {
    constructor(
        private main: Multiplayer,
    ) { }

    public register(): void {
        const originalLoad = ig.game.loadLevel;
        ig.game.loadLevel = (...args) => {
            this.onMapEnter(args[0]);
            const result = originalLoad.call(ig.game, ...args);
            this.main.loadingMap = false;
            return result;
        };
    }

    public onMapEnter(data: MapData): void {
        this.loadEntity('multiplayer');

        if (!this.main.host) {
            const entities = data.entities;
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];

                if (entity.type === 'Enemy') {
                    this.loadEntity(entity.settings.enemyInfo.type);

                    entities.splice(i, 1);
                    i--;
                } else if (entities[i].type === 'EnemySpawner') {
                    if (entity.settings.enemyTypes) {
                        const types: any[] = entities[i].settings.enemyTypes;
                        for (const type of types) {
                            this.loadEntity(type.info.type);
                        }
                    }
                    entities.splice(i, 1);
                    i--;
                }
            }
        }
    }

    private loadEntity(name: string): void {
        new sc.EnemyType(name).load();
    }
}
