import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Twitch AI Moderator',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['https://www.twitch.tv/*'],
  },
  modules: ['@wxt-dev/module-react'],
});