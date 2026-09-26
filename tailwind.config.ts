import type { Config } from 'tailwindcss';

export default {
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    './src/**/*.{html,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        x: {
          bg: '#000000',
          card: '#16181c',
          border: '#2f3336',
          text: '#e7e9ea',
          muted: '#71767b',
          blue: '#1d9bf0',
          blueHover: '#1a8cd8',
          like: '#f91880',
          retweet: '#00ba7c'
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
