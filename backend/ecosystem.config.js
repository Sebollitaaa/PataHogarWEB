module.exports = {
  apps: [
    {
      name: 'patahogar-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      watch: false,
      max_memory_restart: '400M',
      // NODE_ENV queda en development mientras probamos localmente sin Resend configurado.
      // Cambiar a 'production' cuando se despliegue de verdad con RESEND_API_KEY en el .env del servidor.
      env: {
        NODE_ENV: 'development',
      },
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
