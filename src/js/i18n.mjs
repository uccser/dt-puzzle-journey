import DEBUG from './constants.mjs';

// Import third party libraries
import i18next from 'i18next';
import locI18next from 'loc-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../locales/en/translation.json';
import translationMI from '../locales/mi/translation.json';


// Setup internationalisation (i18n)
i18next.use(LanguageDetector).init({
    fallbackLng: 'en',
    debug: DEBUG,
    resources: {
        en: {
            translation: translationEN,
        },
        mi: {
            translation: translationMI,
        },
    },
});


const localise = locI18next.init(i18next, {
    selectorAttr: 'data-i18n',
    optionsAttr: 'data-i18n-options',
    useOptionsAttr: true,
});


function refreshI18n() {
    localise('body');
}


function i18n(key, options) {
    return i18next.t(key, options);
};

export { refreshI18n, i18n, i18next}
