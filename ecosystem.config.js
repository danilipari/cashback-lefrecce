module.exports = {
  apps: [
    {
      name: 'main-app',
      script: './index.mjs',
      node_args: '--experimental-modules',
    },
    {
      name: 'nest-app',
      script: './bot/dist/main.js',
    },
  ],
};
