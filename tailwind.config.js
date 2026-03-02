module.exports = {
  theme: {
    extend: {
      keyframes: {
        // Animação de flutuar suave
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Animação de "respiração" (opcional, para escala)
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      },
      animation: {
        // float: nome | duração | curva | repetição
        float: 'float 3s ease-in-out infinite',
        floatFast: 'float 2s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}