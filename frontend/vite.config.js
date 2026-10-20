import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express backend so the auth cookie is same-origin
      "/api": "http://localhost:3000",
    },
  },
});
