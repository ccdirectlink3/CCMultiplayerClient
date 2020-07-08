import { IConfigFile } from './configFile.js';
import { IConnection } from './connection.js';
import { SocketIoConnector } from './connectors/SocketIOConnector.js';
import { Multiplayer } from './multiplayer.js';
import { IServer } from './server.js';

export class MultiplayerConfig {
    public modPath: string;
    public servers: IServer[] = [];

    private readonly CONNECTORS: {[type: string]: any} = {
        http: SocketIoConnector,
        https: SocketIoConnector,
    };

    private configPath = 'config.json';

    constructor(configPath?: string) {
        this.modPath = modloader.loadedMods.get('multiplayer')!.baseDirectory;
        this.configPath = this.modPath + (configPath || this.configPath);
    }

    public async load(): Promise<void> {
        const { servers } = await ccmod.resources.loadJSON<IConfigFile>('/' + this.configPath);
        this.servers = servers;
    }

    public getConnection(main: Multiplayer, index: number): IConnection {
        const server = this.servers[index];
        for (const type in this.CONNECTORS) {
            if (type === server.type) {
                return new this.CONNECTORS[type](main, server);
            }
        }
        throw new Error('No connector found');
    }
}
