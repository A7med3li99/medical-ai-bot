/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#1E88E5", // لون جديد يعكس الاحترافية
        secondary: "#6C757D",
        success: "#28A745",
        danger: "#DC3545",
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')], // إضافة لدعم تصميم أفضل للنماذج
};
