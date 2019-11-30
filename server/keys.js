module.exports = {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },

    pg: {
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
    }
}