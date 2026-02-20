module.exports = {
  apps: [
    {
      name: 'cricket-backend',
      script: './dist/server.js',

      // Cluster mode - use all CPU cores
      instances: 'max', // or specify number like 4
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Memory management
      max_memory_restart: '500M', // Restart if memory exceeds 500MB

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Graceful shutdown
      kill_timeout: 5000, // Wait 5s for graceful shutdown
      listen_timeout: 3000, // Wait 3s for app to start listening

      // Watch mode (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],

      // Other options
      instance_var: 'INSTANCE_ID',

      // PM2 Plus monitoring (optional)
      // pmx: true,
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/cricket-management-system.git',
      path: '/var/www/cricket-backend',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
