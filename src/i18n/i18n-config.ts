import i18n, { use as customUse } from 'i18next';
import { initReactI18next } from 'react-i18next';
import esPY from './es-PY';

const resources = {
  'es-PY': esPY,
};

const initI18n = async () => {
  customUse(initReactI18next).init({
    resources,
    lng: 'es-PY',
    fallbackLng: 'es-PY',
    defaultNS: 'aboutScreens',
    interpolation: { escapeValue: false },
  });
};

initI18n();

declare module 'i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom resources type
    resources: (typeof resources)['es-PY'];
  }
}

export default i18n;
