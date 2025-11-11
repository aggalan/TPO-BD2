// repository/redis/cache.repository.js
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.connect().catch(console.error);

async function invalidateCache(key) {
    try {
        await client.del(key);
        console.log("[REDIS] Cache invalidada:", key);
    } catch (err) {
        console.error("[REDIS] Error invalidando cache:", err);
    }
}

// Para borrar varias keys de una sola vez
async function invalidateMultiple(keys = []) {
    try {
        if (keys.length === 0) return;
        await client.del(keys);
        console.log("[REDIS] Caches invalidadas:", keys);
    } catch (err) {
        console.error("[REDIS] Error invalidando multiples caches:", err);
    }
}
async function getCache(key) {
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("[REDIS] Error en getCache():", err);
        return null;
    }
}

// ------------------------------------------------------
// SET (guardar un valor con TTL opcional)
// ------------------------------------------------------
async function setCache(key, value, ttlSeconds = 60) {
    try {
        await client.set(key, JSON.stringify(value), {
            EX: ttlSeconds
        });
    } catch (err) {
        console.error("[REDIS] Error en setCache():", err);
    }
}

async function getOrSetCache(key, ttlSeconds, fetchFn) {
    const cached = await getCache(key);
    if (cached !== null) {
        return cached; // ✅ devuelve cache
    }

    const freshData = await fetchFn();

    await setCache(key, freshData, ttlSeconds);

    return freshData;
}

module.exports = {
    invalidateCache,
    invalidateMultiple,
    getCache,
    setCache,
    getOrSetCache,
    client
};
