const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

i18next
    .use(Backend)
    .init({
        backend: {
            loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json')
        },
        fallbackLng: 'en',
        preload: ['en', 'vi'],
        ns: ['common', 'errors'],
        defaultNS: 'common',
        debug: process.env.NODE_ENV === 'development'
    });

module.exports = i18next; 