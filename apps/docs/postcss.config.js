/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},  // ← NEW syntax for Next.js 16
    autoprefixer: {},
  },
}

module.exports = config
