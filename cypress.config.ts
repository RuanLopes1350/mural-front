import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
    env: {
      NEXTAUTH_URL: 'https://ifroevents.app.fslab.dev'
    },
  },
});
