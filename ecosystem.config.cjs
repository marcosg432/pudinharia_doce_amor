/**
 * PM2 — Hostinger (VPS) porta 3011
 *
 * No servidor:
 *   cd /caminho/do/projeto
 *   npm ci --omit=dev
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   # seguir a instrução exibida para persistir após reboot
 */
module.exports = {
    apps: [
        {
            name: 'pudinharia-doce-amor',
            script: './server.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '250M',
            autorestart: true,
            min_uptime: '5s',
            max_restarts: 15,
            restart_delay: 2000,
            env: {
                NODE_ENV: 'production',
                PORT: 3011,
                HOST: '0.0.0.0',
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3011,
                HOST: '0.0.0.0',
            },
            time: true,
            merge_logs: true,
        },
    ],
};
