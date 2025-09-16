import i18next from 'i18next'
import en from './en.json' with { type: 'json' }
import zh from './zh.json' with { type: 'json' }

const i18n = i18next

i18next.init({
  lng: 'zh',
  fallbackLng: 'zh',
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
})

export default i18n
