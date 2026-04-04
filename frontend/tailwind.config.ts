import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        k: {
          bg:           '#F8F7F4',
          'bg-subtle':  '#F0EEE9',
          surface:      '#FFFFFF',
          'surface-2':  '#F4F3F0',
          ink:          '#141414',
          'ink-2':      '#4A4A4A',
          'ink-3':      '#787878',
          'ink-4':      '#A8A8A8',
          amber:        '#E8A030',
          'amber-mid':  '#D4850A',
          'amber-dark': '#B36A00',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'k-xs':   '11px',
        'k-sm':   '13px',
        'k-base': '16px',
        'k-md':   '18px',
        'k-lg':   '20px',
        'k-xl':   '24px',
        'k-2xl':  '32px',
        'k-3xl':  '44px',
        'k-4xl':  '58px',
        'k-5xl':  '72px',
      },
      borderRadius: {
        'k-xs':   '4px',
        'k-sm':   '8px',
        'k-md':   '12px',
        'k-lg':   '18px',
        'k-xl':   '24px',
      },
      boxShadow: {
        'k-xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'k-sm':    '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'k-md':    '0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        'k-lg':    '0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
        'k-float': '0 20px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        'k-ease':     'cubic-bezier(0.22, 1, 0.36, 1)',
        'k-ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        pulseAmber: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 160, 48, 0.28)' },
          '50%':      { boxShadow: '0 0 0 8px transparent' },
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ticker':     'ticker 28s linear infinite',
        'pulse-amber':'pulseAmber 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
