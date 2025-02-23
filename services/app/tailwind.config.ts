import { act } from 'react';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config = {
    darkMode: ['class'],
    content: ['./src/**/*.{ts,tsx}'],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        colors: {
            background: 'hsl(var(--background))', // background color
            foreground: 'hsl(var(--foreground))', // text color
            border: colors.gray[300],
            input: colors.gray[300],
            ring: colors.gray[300],
            neutral: {
                DEFAULT: colors.gray[300]
            },

            popover: {
                DEFAULT: 'hsl(var(--popover))',
                foreground: 'hsl(var(--popover-foreground))'
            },

            // primary: {
            //     lighter: 'oklch(var(--primary-100)) /* oklch(94% 0.035 298) */',
            //     light: 'oklch(var(--primary-300)) /* oklch(80% 0.25 298) */',
            //     DEFAULT: 'oklch(var(--primary-500)) /* oklch(58% 0.25 298) */',
            //     dark: 'oklch(var(--primary-600)) /* oklch(48% 0.25 298) */',
            //     darker: 'oklch(var(--primary-700)) /* oklch(40% 0.25 298) */'
            // },
            primary: {
                50: 'oklch(97% 0.0108 298)',
                100: 'oklch(90% 0.02 298)',
                200: 'oklch(80% 0.05 298)',
                300: 'oklch(70% 0.12 298)',
                400: 'oklch(60% 0.19 298)',
                DEFAULT: 'oklch(53% 0.27 298)',
                600: 'oklch(43% 0.19 298)',
                700: 'oklch(35% 0.12 298)',
                800: 'oklch(25% 0.05 298)',
                900: 'oklch(15% 0.0898 298)',
                950: 'oklch(10% 0.0236 298)'
                // 50: 'oklch(97.78% 0.0108 298)',
                // 100: 'oklch(93.56% 0.0321 298)',
                // 200: 'oklch(88.11% 0.0609 298)',
                // 300: 'oklch(82.67% 0.0908 298)',
                // 400: 'oklch(74.22% 0.1398 298)',
                // DEFAULT: 'oklch(64.78% 0.25 298)',
                // 600: 'oklch(57.33% 0.1299 298)',
                // 700: 'oklch(46.89% 0.1067 298)',
                // 800: 'oklch(39.44% 0.0898 298)'
            },
            secondary: {
                DEFAULT: 'hsl(var(--secondary-500))',
                foreground: 'hsl(var(--background))',
                background: {
                    DEFAULT: 'hsl(var(--secondary-500))',
                    hover: 'hsl(var(--secondary-300))',
                    active: 'hsl(var(--secondary-600))',
                    disabled: 'hsl(var(--secondary-100))'
                }
            },
            accent: {
                DEFAULT: 'hsl(var(--accent-500))',
                foreground: 'hsl(var(--accent-600))',
                background: {
                    DEFAULT: 'hsl(var(--accent-500))',
                    hover: 'hsl(var(--accent-300))',
                    active: 'hsl(var(--accent-600))',
                    disabled: 'hsl(var(--accent-100))'
                }
            },
            // oklch(var(--dn-accent-300, 0.762 0.177 190.000) / <alpha-value>)

            card: {
                DEFAULT: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))'
            },
            muted: {
                DEFAULT: 'hsl(var(--muted))',
                foreground: 'hsl(var(--muted-foreground))'
            },
            destructive: {
                DEFAULT: 'hsl(var(--destructive))',
                foreground: 'hsl(var(--destructive-foreground))'
            },
            warning: {
                DEFAULT: 'oklch(58% 0.25 105)'
            },
            success: {
                '500': 'oklch(58% 0.25 135)'
            },
            error: {
                DEFAULT: 'oklch(58% 0.25 20)'
            },
            info: {
                DEFAULT: 'oklch(58% 0.25 267)'
            },
            sidebar: {
                foreground: 'hsl(var(--sidebar-foreground))'
            }
        },
        extend: {
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'caret-blink': {
                    '0%,70%,100%': {
                        opacity: '1'
                    },
                    '20%,50%': {
                        opacity: '0'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'caret-blink': 'caret-blink 1.25s ease-out infinite'
            }
            // colors: {
            //     sidebar: {
            //         DEFAULT: 'hsl(var(--sidebar-background))',
            //         foreground: 'hsl(var(--sidebar-foreground))',
            //         primary: 'hsl(var(--sidebar-primary))',
            //         'primary-foreground':
            //             'hsl(var(--sidebar-primary-foreground))',
            //         accent: 'hsl(var(--sidebar-accent))',
            //         'accent-foreground':
            //             'hsl(var(--sidebar-accent-foreground))',
            //         border: 'hsl(var(--border))',
            //         ring: 'hsl(var(--sidebar-ring))'
            //     }
            // }
        }
    },
    plugins: [require('tailwindcss-animate')]
} satisfies Config;

export default config;
