/****/ 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Extracted from logo palette
        brand: '#5AA6A5', // teal from headscarf
        secondary: '#6B584B', // dark brown text
        accent: '#E8D5B7', // dough beige
        wood: '#C98E5A' // rolling pin wood
      },
      borderRadius: {
        xl: '12px',
        lg: '8px'
      },
      boxShadow: {
        card: '0 6px 20px rgba(0,0,0,0.06)',
        cardHover: '0 10px 24px rgba(0,0,0,0.10)'
      }
    }
  },
  plugins: [],
}
