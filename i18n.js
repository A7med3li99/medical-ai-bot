import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en', // Default language
  fallbackLng: 'en', // Fallback to English if a key is missing
  interpolation: { escapeValue: false },
});

// Change language dynamically
window.changeLanguage = function (lang) {
  i18n.changeLanguage(lang);
  document.documentElement.setAttribute('lang', lang); // Update HTML lang attribute
  updateUI();
};

// Update UI dynamically after changing the language
function updateUI() {
  document.querySelectorAll("[id^='i18n-']").forEach((element) => {
    const key = element.id.replace('i18n-', '');
    element.textContent = i18n.t(key);
  });
}

export default i18n;
