import { IMultiplayerEntity } from './mpEntity.js';

export interface IPlayer {
    name: string;
    position: Vec3;
    entity: IMultiplayerEntity;
}
