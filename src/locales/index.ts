import i18next from 'i18next'
import en from './en.json' with { type: 'json' }

const i18n = i18next

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
  },
})

export default i18n
