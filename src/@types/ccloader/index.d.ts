declare let activeMods: Mod[];
declare let inactiveMods: Mod[];
declare let cc: cc;

/**
 * You should never be able to aquire an instance of this in a mod
 */
interface CCLoader {

}

interface Mod {
    initialize(): void;
    load(cb: Function): void;
    onload(cb: Function): void;
    getName(): string;
    getDescription(): string | undefined;
    getAssets(): string[];
    getAsset(path: string): string;
    setAsset(original: string, modified: string): void;
    getBaseDirectory(): string;
    initializeTable(ccloader: CCLoader, cb: Function): void;
    executeTable(ccloader: CCLoader): void;
    isEnabled(): boolean;
}

interface cc {
    ig: cc.ig;
    sc: cc.sc;
}
declare namespace cc {
    interface ig {
        GUI: ig.Gui;
        varNames: ccig.varNames;
        gameMain: ig.GameMain;
        baseEntity: ig.Entity;
        entityList: ig.EntityList;
        events: ig.EventList;
        TeleportPosition: ig.TeleportPosition;
        
        playerInstance(): ig.Player;
    }
    namespace ccig {
        interface varNames {
            titleScreenButtons: string;
            gameMainLoadMap: string;
            gameMainTeleport: string;
            entityKill: string;
            gameMainSpawnEntity: string;
            entityData: string;
            entityPosition: string;
            currentAnimation: string;
            currentState: string;
            systemHasFocusLost: string;
            activate: string;
        }
    }

    interface sc {
        EnemyType: ccsc.EnemyType;
        ButtonListBox: sc.ButtonListBox;
        SaveSlotButton: sc.SaveSlotButton;
        varNames: ccsc.varNames;
    }
    namespace ccsc {
        interface varNames {
            init: string;
            autoSlotMiss: string;
        }
        interface EnemyType {
            new (name: string): sc.EnemyType;
        }
    }
}