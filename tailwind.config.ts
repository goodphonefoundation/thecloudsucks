import type { Config } from 'tailwindcss';
import tailwindcssForms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	darkMode: 'class',
	content: [
		'./components/**/*.{vue,js,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./app.vue',
		'./plugins/**/*.{js,ts}',
		`./App.{js,ts,vue}`,
		`./app.{js,ts,vue}`,
		`./nuxt.config.{js,ts}`,
		`./form.theme.js`,
		`./formkit.config.{js,ts}`,
	],
	theme: {
		extend: {
			colors: {
				'tech-primary': '#0d7ff2',
				'tech-bg-light': '#f5f7f8',
				'tech-bg-dark': '#0a0f14',
				'tech-surface': '#16222c',
				'tech-border': '#223649',
				'tech-muted': '#90adcb',
				'tech-highlight': '#445566',
			},
			borderRadius: {
				card: 'var(--border-radius-card)',
				button: 'var(--border-radius-button)',
				input: 'var(--border-radius-input)',
				panel: 'var(--border-radius-panel)',
			},
			fontFamily: {
				sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
				display: ['var(--font-display)', ...defaultTheme.fontFamily.serif],
				mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
				signature: ['var(--font-signature)', 'cursive', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fade-in 0.5s linear forwards',
			},
			keyframes: {
				'fade-in': {
					from: {
						opacity: '0',
					},
					to: {
						opacity: '1',
					},
				},
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [
		tailwindcssForms,
		// Formkit Plugin for Tailwind
		// https://formkit.com/guides/create-a-tailwind-theme
		// require('@formkit/themes/tailwindcss'),
	],
} satisfies Config;
