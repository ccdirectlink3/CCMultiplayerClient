import { MultiplayerConfig } from './config.js';
import { IConnection } from './connection.js';
import { IEntityDefinition } from './entityDefinition.js';
import { OnKillEntityListener } from './listeners/connection/onKillEntity.js';
import { OnPlayerChangeMapListener } from './listeners/connection/onPlayerChangeMap.js';
import { OnRegisterEntityListener } from './listeners/connection/onRegisterEntity.js';
import { OnSetHostListener } from './listeners/connection/onSetHost.js';
import { OnThrownBallListener } from './listeners/connection/onThrowBall.js';
import { OnUpdateAnimationListener } from './listeners/connection/onUpdateAnimation.js';
import { OnUpdateAnimationTimerListener } from './listeners/connection/onUpdateAnimationTimer.js';
import { OnUpdateEntityAnimationListener } from './listeners/connection/onUpdateEntityAnimation.js';
import { OnUpdateEntityHealthListener } from './listeners/connection/onUpdateEntityHealth.js';
import { OnUpdateEntityPositionListener } from './listeners/connection/onUpdateEntityPosition.js';
import { OnUpdateEntityStateListener } from './listeners/connection/onUpdateEntityState.js';
import { OnUpdateEntityTargetListener } from './listeners/connection/onUpdateEntityTarget.js';
import { OnUpdatePositionListener } from './listeners/connection/onUpdatePosition.js';
import { EntityListener } from './listeners/game/entityListener.js';
import { OnEntityAnimationListener } from './listeners/game/onEntityAnimation.js';
import { OnEntityHealthChangeListener } from './listeners/game/onEntityHealthChange.js';
import { OnEntityMoveListener } from './listeners/game/onEntityMove.js';
import { OnEntitySpawnListener } from './listeners/game/onEntitySpawn.js';
import { OnEntityTargetChangeListener } from './listeners/game/onEntityTargetChange.js';
import { OnEntityKilledListener } from './listeners/game/onKill.js';
import { OnMapEnterListener } from './listeners/game/onMapEnter.js';
import { OnMapLoadedListener } from './listeners/game/onMapLoaded.js';
import { OnPlayerAnimationListener } from './listeners/game/onPlayerAnimation.js';
import { OnPlayerHealthChangeListener } from './listeners/game/onPlayerHealthChange.js';
import { OnPlayerMoveListener } from './listeners/game/onPlayerMove.js';
import { OnTeleportListener } from './listeners/game/onTeleport.js';
import { PlayerListener } from './listeners/game/playerListener.js';
import { LoadScreenHook } from './loadScreenHook.js';
import { IMultiplayerEntity } from './mpEntity.js';
import { IPlayer } from './player.js';

export class Multiplayer {
    public futureEntities: IEntityDefinition[] = [];
    public players: {[name: string]: IPlayer | undefined} = {};
    public config: MultiplayerConfig;
    public connection!: IConnection;
    public name?: string;
    public host = false;
    public loadingMap = false;

    public entities: IMultiplayerEntity[] = [];

    private loadScreen!: () => void;
    private nextEID = 1;
    private entitySpawnListener!: OnEntitySpawnListener;
    private loadScreenHook = new LoadScreenHook();

    constructor(config?: MultiplayerConfig) {
        if (config) {
            this.config = config;
        } else {
            this.config = new MultiplayerConfig();
        }
    }

    public async load(): Promise<void> {
        await this.config.load();
    }

    public async waitForServerSelection(index: number): Promise<void> {
        this.connection = this.config.getConnection(this, index);
    }

    public initialize(): void {
        this.initializeGUI();
        this.disableFocus();
    }

    public async connect(): Promise<void> {
        const serverNumber = await this.loadScreenHook.displayServers(
            this.config.servers.map((server) => server.hostname),
            this.loadScreen);

        // Go back to previous sub state (out of the menu).
        sc.model.enterPrevSubState();

        await this.waitForServerSelection(serverNumber);

        const username = await this.showLogin();

        await this.connection.load();

        if (!this.connection.isOpen()) {
            console.log('[multiplayer] Connecting..');
            await this.connection.open(this.config.servers[serverNumber].hostname,
                this.config.servers[serverNumber].port,
                this.config.servers[serverNumber].type);
        }

        this.initializeListeners();

        console.log('[multiplayer] Logging in as ' + username);
        const result = await this.connection.identify(username);

        if (!result.success) {
            throw new Error('[multiplayer] Could not login! Is the user already logged in?');
        }

        if (result.host) {
            console.log('[multiplayer] This user is the host');
            this.host = true;
        }

        console.log('[multiplayer] Loading map: ' + result.mapName);

        // Set a map via the load level on game start variable.
        // Thank you CrossCode Developers for including this!
        LOAD_LEVEL_ON_GAME_START = result.mapName;
    }

    public registerEntity(entity: ig.Entity): number {
        const converted = entity as IMultiplayerEntity;
        converted.multiplayerId = this.nextEID;
        this.entities[this.nextEID] = converted;
        this.nextEID++;

        return converted.multiplayerId;
    }

    public spawnMultiplayerEntity(e: IEntityDefinition): any {
        new sc.EnemyType(e.settings.enemyInfo.type).load(() => {
            const entity = this.entitySpawnListener.onEntitySpawned(e.type, e.pos.x, e.pos.y, e.pos.z, e.settings);

            const me = this.entities[e.id] = entity as IMultiplayerEntity;
            me.multiplayerId = e.id;

            const protectedPos = {xProtected: e.pos.x, yProtected: e.pos.y, zProtected: e.pos.z};
            Object.defineProperty(protectedPos, 'x', { get() { return protectedPos.xProtected; }, set() { return; } });
            Object.defineProperty(protectedPos, 'y', { get() { return protectedPos.yProtected; }, set() { return; } });
            Object.defineProperty(protectedPos, 'z', { get() { return protectedPos.zProtected; }, set() { return; } });
            Object.defineProperty(entity.coll, 'pos',
                { get() { return protectedPos; }, set() {console.log('tried to maniplulate pos'); } });

            let protectedAnim = me.currentAnim;

            Object.defineProperty(entity, 'currentAnim', {
                get() { return protectedAnim; },
                set(data) { if (data.protected) { protectedAnim = data.protected; } },
            });

            const protectedFace = !!me.face ? {xProtected: me.face.x, yProtected: me.face.y}
                                                : {xProtected: 0, yProtected: 0};
            Object.defineProperty(protectedFace, 'x', {get() { return protectedFace.xProtected; }, set() { return; } });
            Object.defineProperty(protectedFace, 'y', {get() { return protectedFace.yProtected; }, set() { return; } });
            Object.defineProperty(entity, 'face',
                { get() { return protectedFace; }, set() {console.log('tried to maniplulate face'); } });

            let protectedState = me.currentState;
            Object.defineProperty(entity, 'currentState', {
                get() { return protectedState; },
                set(data) { if (data.protected) { protectedState = data.protected; } },
            });
        });
    }

    public copyPosition(from: Vec3, to: Vec3) {
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    }
    public copyEntityPosition(from: Vec3, to: any) {
        if (!to.xProtected) {
            return this.copyPosition(from, to);
        }

        to.xProtected = from.x;
        to.yProtected = from.y;
        to.zProtected = from.z;
    }

    private initializeGUI(): void {
        const buttonNumber = ig.platform === 1 ? 2 : 1;

        const title = ig.gui.guiHooks.find((hook) => hook.gui instanceof sc.TitleScreenGui)!;
        const titleButtonGui = title.children[2].gui as sc.TitleScreenButtonGui;
        const buttons = titleButtonGui.buttons;
        // buttons.splice(buttonNumber, 2);
        // buttons[2].a.g.y = 80;
        buttons[buttonNumber].setText('Connect', true);
        this.loadScreen = buttons[buttonNumber].onButtonPress;
        buttons[buttonNumber].onButtonPress = this.startConnect.bind(this);
    }

    private initializeListeners(): void {
        const entityListener = new EntityListener(this);
        const playerListener = new PlayerListener(this);

        entityListener.register();
        playerListener.register();

        const playerMove = new OnPlayerMoveListener(this);
        const playerAnimation = new OnPlayerAnimationListener(this);
        const playerHealth = new OnPlayerHealthChangeListener(this);
        const entityMove = new OnEntityMoveListener(this);
        const entityAnimation = new OnEntityAnimationListener(this);
        const entityHealthChange = new OnEntityHealthChangeListener(this);
        const entityTargetChange = new OnEntityTargetChangeListener(this);

        playerMove.register(playerListener);
        playerAnimation.register(playerListener);
        playerHealth.register(playerListener);
        entityMove.register(entityListener);
        entityAnimation.register(entityListener);
        entityHealthChange.register(entityListener);
        entityTargetChange.register(entityListener);

        const mapEnter = new OnMapEnterListener(this);
        const teleport = new OnTeleportListener(this);
        const killed = new OnEntityKilledListener(this);
        const spawn = new OnEntitySpawnListener(this);
        const mapLoaded = new OnMapLoadedListener(this);

        mapEnter.register();
        teleport.register();
        killed.register();
        spawn.register();
        mapLoaded.register();

        this.entitySpawnListener = spawn;

        const setHost = new OnSetHostListener(this);
        const playerChange = new OnPlayerChangeMapListener(this);
        const updatePosition = new OnUpdatePositionListener(this);
        const updateAnim = new OnUpdateAnimationListener(this);
        const updateAnimTimer = new OnUpdateAnimationTimerListener(this);
        const registerEntity = new OnRegisterEntityListener(this);
        const killEntity = new OnKillEntityListener(this);
        const throwBall = new OnThrownBallListener(this);
        const entityPosition = new OnUpdateEntityPositionListener(this);
        const entityAnim = new OnUpdateEntityAnimationListener(this);
        const entityState = new OnUpdateEntityStateListener(this);
        const entityTarget = new OnUpdateEntityTargetListener(this);
        const entityHealth = new OnUpdateEntityHealthListener(this);

        setHost.register();
        playerChange.register();
        updatePosition.register();
        updateAnim.register();
        updateAnimTimer.register();
        registerEntity.register();
        killEntity.register();
        throwBall.register();
        entityPosition.register();
        entityAnim.register();
        entityState.register();
        entityTarget.register();
        entityHealth.register();
    }

    private startConnect(): void {
        this.connect()
            .then(() => {
                console.log('[multiplayer] Connected');
                this.launchGame();
            })
            .catch((err: any) => {
                console.error(err);
            });
    }

    private launchGame(): void {
        // Remove title screen interact.
        // const buttonInteract = ig.gui.menues[15].children[2].buttonInteract; // TODO Resolve buttonInteract
        // ig.interact.removeEntry(buttonInteract);

        ig.interact.removeEntry(ig.interact.entries[0]);
        ig.bgm.clear('MEDIUM_OUT'); // Clear BGM
        ig.game.start(); // Start the game in story mode.
    }

    private showLogin(): Promise<string> {
        return new Promise((resolve, reject) => {
            const box = $('<div class="gameOverlayBox gamecodeMessage" ><h3>Multiplayer Login</h3></div>');
            const form = $('<form><input type="text" name="username" placeholder="Username" /> \
                            <input type="submit" name="send" value="Submit" /><form>');
            box.append(form);

            form.submit(() => {
                const userInput = form[0].firstElementChild as HTMLInputElement;

                const name = userInput.value;
                if (!name || name === '') {
                    reject(name);
                }

                ig.system.regainFocus();
                resolve(name);

                return false;
            });

            $(document.body).append(box);
            box.addClass('shown');
            ig.system.setFocusLost();

            ig.system.addFocusListener((_) => {
                box.remove();
            });

            form.find('input[type=text]').focus();
        });
    }

    private disableFocus() {
        ig.system.hasFocusLost = () => false;
    }
}
