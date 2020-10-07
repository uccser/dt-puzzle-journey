import { DEBUG } from './constants.mjs';
import { getRandomInt } from './utilities.mjs';
import { Howl, Howler } from 'howler';

const FADE_DURATION = 2000;
const MUSIC_VOLUME = 0.8;
const AUDIO_FX = {
    'change-stage': new Howl({
        src: [require('../audio/fx-stage-change-2.wav')],
    }),
    'click': new Howl({
        src: [require('../audio/fx-click.wav')],
    }),
    'incorrect': new Howl({
        src: [require('../audio/fx-click.wav')],
    }),
    'fern-flip': [
        new Howl({
            src: [require('../audio/fx-fern-flip-1.wav')],
        }),
        new Howl({
            src: [require('../audio/fx-fern-flip-2.wav')],
        }),
    ],
    'rope-creak': new Howl({
        src: [require('../audio/fx-rope-creak.wav')],
    }),
    'rope-pickup': [
        new Howl({
            src: [require('../audio/fx-rope-pickup-1.wav')],
            volume: 0.3,
        }),
        new Howl({
            src: [require('../audio/fx-rope-pickup-2.wav')],
            volume: 0.3,
        }),
        new Howl({
            src: [require('../audio/fx-rope-pickup-3.wav')],
            volume: 0.3,
        }),
    ],
    'steps': [
        new Howl({
            src: [require('../audio/fx-steps-1.wav')],
        }),
        new Howl({
            src: [require('../audio/fx-steps-2.wav')],
        }),
        new Howl({
            src: [require('../audio/fx-steps-3.wav')],
        }),
        new Howl({
            src: [require('../audio/fx-steps-4.wav')],
        }),
    ],
    'success': new Howl({
        src: [require('../audio/fx-success.wav')],
    }),
    'writing': new Howl({
        src: [require('../audio/fx-writing.wav')],
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
    'plains': new Howl({
        src: [require('../audio/ambience-plains.wav')],
        loop: true,
        volume: 0,
    }),
    'pa': new Howl({
        src: [require('../audio/ambience-pa.wav')],
        loop: true,
        volume: 0,
    }),
    'opening': new Howl({
        src: [require('../audio/music-opening.wav')],
        loop: false,
        volume: 1,
    }),
};


function playFX(name) {
    let sound_file = AUDIO_FX[name];
    if (Array.isArray(sound_file)) {
        sound_file = sound_file[getRandomInt(0, sound_file.length)];
    }
    if (DEBUG) {
        console.log(`Playing sound for '${name}'`);
    }
    sound_file.play();
}


function playMusic(stage_name) {
    var music = AUDIO_MUSIC[stage_name];
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
