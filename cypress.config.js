import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  // Sem eventos de Node por enquanto (o gancho vazio só gerava aviso no lint).
  e2e: {},
});
