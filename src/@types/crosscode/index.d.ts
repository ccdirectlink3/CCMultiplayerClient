declare namespace simplify {
    function registerUpdate(func: () => void): void;
}

declare interface Vec2 {
    x: number;
    y: number;
}

declare namespace Vec2 {
    function assign(a: Vec2, b: Vec2): Vec2;
    function createC(x?: number, y?: number): Vec2;
}

declare interface Vec3 {
    x: number;
    y: number;
    z: number;
}

declare namespace Vec3 {
    function createC(x?: number, y?: number, z?: number): Vec3;
}

declare interface SaveData {

}

declare interface MapData {
    entities: Array<{
        type: string;
        settings: any;
    }>;
}

declare namespace ActionData {
    interface SHOW_ANIMATION {
        type: 'SHOW_ANIMATION';
        anim: string;
        followUp?: string;
        wait?: boolean;
        viaWalkConfig?: boolean;
    }
    interface WAIT {
        type: 'WAIT';
        time: number;
        assistSlow?: boolean;
    }
}
declare type ActionData = {type: string} | ActionData.SHOW_ANIMATION | ActionData.WAIT;

declare namespace ProxyData {

}
declare interface ProxyData {type: string; }

declare namespace sc {
    class CrossCode extends ig.Game {
        public start(mode?: sc.START_MODE, transition?: number): void;
        public update(): void;
        public isTeleporting(): boolean;
    }

    class GameModel extends ig.GameAddon {
        public enterPrevSubState(): void;
    }

    class EnemyType extends ig.JsonLoadable {
        constructor(name: string);
    }

    class ButtonGui extends ig.FocusGui {
        public onButtonPress: () => void;

        public setText(text: string, center?: boolean): void;
    }

    class SaveSlotButton extends ig.FocusGui {
        public autoSlotMiss: sc.TextGui;

        constructor(save?: SaveData, slot?: number);
    }

    class TitleScreenGui extends ig.GuiElementBase {

    }

    class TextGui extends ig.GuiElementBase {
        public readonly text: string;

        public setText(text: string): void;
    }

    class TitleScreenButtonGui extends ig.GuiElementBase {
        public buttons: sc.ButtonGui[];
    }

    class ButtonListBox extends sc.ScrollPane {
        public buttonGroup: sc.ButtonGroup;

        public activate(buttonInteract?: ig.ButtonInteractEntry): void;
        public addButton(
            button: ig.GuiElementBase | ig.FocusGui,
            canFocus?: boolean,
            xOffset?: number,
            yOffset?: number,
            ): void;
        public clear(skipFirst?: boolean): void;
    }

    class ButtonGroup extends ig.Class {
        public pressCallbacks: Array<(element?: ig.FocusGui, mouseOver?: boolean) => void>;
        public selectionCallbacks: Array<(element?: ig.FocusGui) => void>;
    }

    class ScrollPane extends ig.GuiElementBase {

    }

    class CombatParams extends ig.Class {
        public currentHp: number;

        public getStat(name: string): number;
    }

    class PlayerBaseEntity extends ig.ENTITY.Combatant {

    }

    class BasicCombatant extends ig.ActorEntity {
        public getCombatantRoot(): sc.BasicCombatant;
    }

    class ProxySpawnerBase extends ig.Class {
        public data: object;

        public spawn(x: number, y: number, z: number, entity: sc.BasicCombatant, dir: Vec2): void;
    }

    namespace ProxyTools {
        function getProxy(src: sc.ProxySpawnerBase): sc.ProxySpawnerBase;
        function getProxy(
            src: string,
            entity: { getCombatantRoot(): sc.BasicCombatant },
        ): sc.ProxySpawnerBase;
    }

    class VerionChangeLog extends ig.SingleLoadable {
        public toString(): string;
    }

    enum START_MODE {
        STORY = 0,
        GRINDING = 1,
        PUZZLE = 2,
    }

    let model: sc.GameModel;
    let version: sc.VerionChangeLog;
}

declare namespace ig {
    class Class {
        public static inject(injected: object): Class;
        public static extend(extended: object): Class;
    }

    class Game extends ig.Class {
        public entities: ig.Entity[];
        public playerEntity: ig.ENTITY.Player;

        public spawnEntity<T extends ig.Entity>(
            entity: string | (new(...args: any[]) => T),
            x: number,
            y: number,
            z: number,
            showAppearEffects?: object,
            hidden?: boolean,
            ): T;
        public teleport(mapName: string, marker?: ig.TeleportPosition, loadHint?: string, clearCache?: boolean): void;
        public loadLevel(data: MapData, cleanCache?: boolean): void;
    }

    class TeleportPosition extends ig.Class {
        public static createFromJson(settings: {
            marker: string;

            pos?: Vec3;
            size?: Vec2;
            face?: Vec2;

            level?: number;
            baseZPos?: number;
        } | {
            pos: Vec3;
            size: Vec2;
            face: Vec2;

            marker?: string;

            level?: number;
            baseZPos?: number;
        }): ig.TeleportPosition;
    }

    class GameAddon extends ig.Class {

    }

    class AnimationState extends ig.Class {
        public timer: number;
    }

    enum ENTITY_ALIGN {
        BOTTOM = 1,
        CENTER = 2,
        TOP = 3,
        FACE = 4,
        BASE = 5,
        WALL_HIT = 6,
        FACE_BASE = 7,
    }

    class Entity extends ig.Class {
        public settings: object;
        public coll: CollEntry;

        public getAlignedPos(alignment: ig.ENTITY_ALIGN, dest: Vec3): Vec3;
        public kill(unusedLevelChange?: boolean): void;
    }

    class AnimatedEntity extends ig.Entity {
        public animState: ig.AnimationState;
        public currentAnim: string;
    }

    class ActorEntity extends ig.AnimatedEntity {
        public face: Vec2;
        public animationFixed: boolean;

        public setAction(action: ActionData[], keepState?: boolean, noStateReset?: boolean): void;
    }

    namespace ENTITY {
        class Combatant extends sc.BasicCombatant {
            public params: sc.CombatParams;
        }
        class Enemy extends ig.ENTITY.Combatant {
            public currentState: string;

            public changeState(state: string, immediate?: boolean): void;
        }
        class Player extends sc.PlayerBaseEntity {
            public proxies: {[name: string]: sc.ProxySpawnerBase} | null;
        }
        class Crosshair extends ig.Entity {

        }
        class CrosshairDot extends ig.AnimatedEntity {

        }
        class OffsetParticle extends ig.ENTITY.Particle {

        }
        class RhombusParticle extends ig.ENTITY.Particle {

        }
        class HiddenSkyBlock extends ig.Entity {

        }
        class Effect extends ig.Entity {

        }
        class Particle extends ig.AnimatedEntity {

        }
        class CopyParticle extends ig.Entity {

        }
        class Ball extends ig.ENTITY.Projectile {

        }
        class Projectile extends ig.AnimatedEntity {

        }
    }

    class CollEntry extends ig.Class {
        public pos: Vec3;
    }

    class InteractEntry extends ig.Class {

    }

    class ButtonInteractEntry extends ig.InteractEntry {

    }

    class InteractManager extends ig.GameAddon {
        public entries: ig.InteractEntry[];

        public removeEntry(entry: ig.InteractEntry): void;
    }

    class Bgm extends ig.GameAddon {
        public clear(mode?: ig.BGM_SWITCH_MODE): void;
    }

    class GuiHook extends ig.Class {
        public gui: ig.GuiElementBase;
        public children: ig.GuiHook[];
    }

    class GuiElementBase extends ig.Class {

    }

    class FocusGui extends ig.GuiElementBase {

    }

    class Gui extends ig.GameAddon {
        public guiHooks: ig.GuiHook[];
    }

    class System extends ig.Class {
        public hasFocusLost(): boolean;
        public setFocusLost(): void;
        public regainFocus(): void;
        public addFocusListener(listener: (focusLost: boolean) => void): void;
    }

    class SaveSlot extends ig.Class {

    }

    class Cacheable extends ig.Class {

    }

    class Loadable extends ig.Cacheable {
        public load(cb?: () => void): void;
    }

    class JsonLoadable extends Loadable {

    }

    class SingleLoadable extends ig.Class {

    }

    class Image extends ig.Loadable {

    }

    class Font extends ig.Image {

    }

    class EventCall extends ig.Class {

    }

    enum PLATFORM_TYPES {
        UNKNOWN = 0,
        DESKTOP = 1,
        BROWSER = 2,
        MOBILE = 3,
        WIIU = 4,
    }

    type BGM_SWITCH_MODE =
        'IMMEDIATELY'
        | 'FAST_OUT'
        | 'MEDIUM_OUT'
        | 'SLOW_OUT'
        | 'VERY_SLOW_OUT'
        | 'FAST'
        | 'MEDIUM'
        | 'SLOW'
        | 'VERY_SLOW';

    let bgm: ig.Bgm;
    let game: sc.CrossCode;
    let gui: ig.Gui;
    let interact: ig.InteractManager;
    let ready: boolean;
    let system: ig.System;
    let platform: ig.PLATFORM_TYPES;
}

declare let LOAD_LEVEL_ON_GAME_START: string | undefined;
