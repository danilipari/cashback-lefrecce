module.exports = {
  apps: [
    {
      name: 'main-app',
      script: './index.mjs',
      node_args: '--experimental-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
    // {
    //   name: 'nest-app',
    //   script: './bot/dist/main.js',
    //   instances: 1,
    //   autorestart: true,
    //   watch: false,
    //   max_memory_restart: '1G',
    //   env: {
    //     NODE_ENV: 'production',
    //   },
    //   env_development: {
    //     NODE_ENV: 'development',
    //   },
    // }
  ],
};
