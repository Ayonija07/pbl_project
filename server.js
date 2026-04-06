const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
loadEnvFile(path.join(ROOT_DIR, '.env'));

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY;
const DEFAULT_MARKET_SYMBOLS = ['AAPL', 'MSFT', 'VOO'];
const ECB_HISTORY_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml';

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            return;
        }

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();
        value = value.replace(/^['"]|['"]$/g, '');

        if (key && !process.env[key]) {
            process.env[key] = value;
        }
    });
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify(payload));
}

function normaliseSymbols(rawValue) {
    if (!rawValue) {
        return DEFAULT_MARKET_SYMBOLS;
    }

    const symbols = rawValue
        .split(',')
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 6);

    return symbols.length > 0 ? symbols : DEFAULT_MARKET_SYMBOLS;
}

function normaliseSingleSymbol(rawValue) {
    const symbol = String(rawValue || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9.\-]/g, '');

    return symbol || DEFAULT_MARKET_SYMBOLS[0];
}

async function fetchMarketstack(endpoint, params) {
    if (!MARKETSTACK_API_KEY) {
        throw new Error('Marketstack API key is missing. Add MARKETSTACK_API_KEY to your .env file.');
    }

    const url = new URL(`https://api.marketstack.com${endpoint}`);
    url.searchParams.set('access_key', MARKETSTACK_API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    const marketResponse = await fetch(url, {
        headers: {
            Accept: 'application/json'
        }
    });

    const payload = await marketResponse.json();
    if (!marketResponse.ok) {
        const errorMessage = payload?.error?.message || payload?.error || 'Marketstack request failed.';
        const error = new Error(errorMessage);
        error.statusCode = marketResponse.status;
        throw error;
    }

    return payload;
}

function parseEcbHistory(xml) {
    const ratesByDate = {};
    const dayMatches = xml.match(/<Cube time="[^"]+">[\s\S]*?<\/Cube>/g) || [];

    dayMatches.forEach((dayBlock) => {
        const dateMatch = dayBlock.match(/time="([^"]+)"/);
        const usdMatch = dayBlock.match(/currency="USD" rate="([^"]+)"/);
        const inrMatch = dayBlock.match(/currency="INR" rate="([^"]+)"/);

        if (!dateMatch || !usdMatch || !inrMatch) {
            return;
        }

        const euroToUsd = Number(usdMatch[1]);
        const euroToInr = Number(inrMatch[1]);
        if (!euroToUsd || !euroToInr) {
            return;
        }

        ratesByDate[dateMatch[1]] = {
            usdToInr: euroToInr / euroToUsd,
            sourceDate: dateMatch[1]
        };
    });

    return ratesByDate;
}

async function getFxRatesByDate() {
    const response = await fetch(ECB_HISTORY_URL, {
        headers: {
            Accept: 'application/xml,text/xml'
        }
    });
    const xml = await response.text();
    if (!response.ok) {
        throw new Error('Unable to fetch ECB exchange rates.');
    }

    return parseEcbHistory(xml);
}

function getDateKey(dateString) {
    return String(dateString || '').slice(0, 10);
}

function findFxRateForDate(ratesByDate, dateString) {
    const dateKey = getDateKey(dateString);
    if (!dateKey) {
        return null;
    }

    if (ratesByDate[dateKey]) {
        return ratesByDate[dateKey];
    }

    const availableDates = Object.keys(ratesByDate).sort().reverse();
    const fallbackDate = availableDates.find((item) => item <= dateKey) || availableDates[0];
    return fallbackDate ? ratesByDate[fallbackDate] : null;
}

function convertUsdToInr(value, fxRate) {
    return fxRate ? Number((Number(value || 0) * fxRate.usdToInr).toFixed(2)) : 0;
}

function mapQuote(item, ratesByDate) {
    const fxRate = findFxRateForDate(ratesByDate, item.date);

    return {
        symbol: item.symbol || '',
        name: item.name || '',
        exchange: item.exchange || '',
        open: convertUsdToInr(item.open, fxRate),
        high: convertUsdToInr(item.high, fxRate),
        low: convertUsdToInr(item.low, fxRate),
        close: convertUsdToInr(item.close, fxRate),
        volume: Number(item.volume) || 0,
        date: item.date || '',
        currency: 'INR',
        usdToInrRate: fxRate ? Number(fxRate.usdToInr.toFixed(4)) : null,
        rateDate: fxRate ? fxRate.sourceDate : null
    };
}

async function handleMarketRequest(requestUrl, response) {
    const symbols = normaliseSymbols(requestUrl.searchParams.get('symbols'));

    try {
        const ratesByDate = await getFxRatesByDate();
        const payload = await fetchMarketstack('/v2/eod/latest', {
            symbols: symbols.join(',')
        });

        const data = Array.isArray(payload.data) ? payload.data : [];
        return sendJson(response, 200, {
            currency: 'INR',
            data: data.map((item) => mapQuote(item, ratesByDate))
        });
    } catch (error) {
        return sendJson(response, error.statusCode || 502, {
            error: error.message || 'Unable to reach Marketstack from the GrowFi proxy.'
        });
    }
}

async function handleMarketHistoryRequest(requestUrl, response) {
    const symbol = normaliseSingleSymbol(requestUrl.searchParams.get('symbol'));
    const limit = Math.max(5, Math.min(14, Number(requestUrl.searchParams.get('limit')) || 7));

    try {
        const ratesByDate = await getFxRatesByDate();
        const payload = await fetchMarketstack('/v2/eod', {
            symbols: symbol,
            limit: String(limit)
        });

        const points = (Array.isArray(payload.data) ? payload.data : [])
            .map((item) => ({
                date: item.date || '',
                close: convertUsdToInr(item.close, findFxRateForDate(ratesByDate, item.date))
            }))
            .filter((item) => item.close > 0)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return sendJson(response, 200, {
            symbol,
            currency: 'INR',
            points
        });
    } catch (error) {
        return sendJson(response, error.statusCode || 502, {
            error: error.message || 'Unable to load historical market data.'
        });
    }
}

function serveStaticFile(requestUrl, response) {
    const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    if (!filePath.startsWith(ROOT_DIR)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, fileBuffer) => {
        if (error) {
            response.writeHead(error.code === 'ENOENT' ? 404 : 500, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'Content-Type': MIME_TYPES[extension] || 'application/octet-stream'
        });
        response.end(fileBuffer);
    });
}

const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);

    if (requestUrl.pathname === '/api/market') {
        handleMarketRequest(requestUrl, response);
        return;
    }

    if (requestUrl.pathname === '/api/market/history') {
        handleMarketHistoryRequest(requestUrl, response);
        return;
    }

    serveStaticFile(requestUrl, response);
});

server.listen(PORT, HOST, () => {
    console.log(`GrowFi server running at http://${HOST}:${PORT}`);
});
