/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ink-navy': '#0F2540',
        'steel-blue': '#1E4E79',
        'safety-amber': '#F5A623',
        'warm-white': '#FAFAF7',
        'iron-gray': '#4B5563',
        'signal-rust': '#D64545',
        'leaf-green': '#2E7D4F',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'tick-ruler': "repeating-linear-gradient(90deg, #F5A623 0px, #F5A623 2px, transparent 2px, transparent 12px)",
      },
    },
  },
  plugins: [],
}
