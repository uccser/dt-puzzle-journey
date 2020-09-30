import { DEBUG } from './constants.mjs';
import { Howl, Howler } from 'howler';

const FADE_DURATION = 2000;
const MUSIC_VOLUME = 0.8;
const AUDIO_FX = {
    'change-stage': new Howl({
        src: [require('../audio/fx-putatara.wav')],
    }),
    'fern-flip': new Howl({
        src: [require('../audio/fx-fern-flip.wav')],
    }),
    'footsteps': new Howl({
        src: [require('../audio/fx-grass-footstep.wav')],
    }),
    'rope-creak': new Howl({
        src: [require('../audio/fx-rope-creak.wav')],
    }),
};
const AUDIO_MUSIC = {
    'forest': new Howl({
        src: [require('../audio/ambience-forest.wav')],
        loop: true,
        volume: 0,
    }),
    'river': new Howl({
        src: [require('../audio/ambience-river.wav')],
        loop: true,
        volume: 0,
    }),
};


function playFX(name) {
    AUDIO_FX[name].play();
    if (DEBUG) {
        console.log(`Playing sound for '${name}'`);
    }
}


function playMusic(stage_name) {
    let music = AUDIO_MUSIC[stage_name];
    if (!music.playing()) {
        music.play();
        music.fade(0, MUSIC_VOLUME, FADE_DURATION);
        if (DEBUG) {
            console.log(`Playing music for stage '${stage_name}'`);
        }
    }
}


function stopMusic(stage_name) {
    let music = AUDIO_MUSIC[stage_name];
    if (music.playing()) {
        music.once('fade', function () {
            music.stop();
            if (DEBUG) {
                console.log(`Stopped music for stage '${stage_name}'`);
            }
        });
        music.fade(MUSIC_VOLUME, 0, FADE_DURATION);
    }
}

export { playFX, playMusic, stopMusic };
