import { Multiplayer } from './multiplayer.js';

async function startMultiplayer(): Promise<void> {
    try {
        const multiplayer = new Multiplayer();

        console.log('[multiplayer] Loading..');

        await multiplayer.load();

        console.log('[multiplayer] Loaded');

        multiplayer.initialize();

        console.log('[multiplayer] Initialized');
    } catch (e) {
        console.error(e);
    }
}

startMultiplayer()
    .catch(console.error.bind(console));
