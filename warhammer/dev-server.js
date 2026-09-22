#!/usr/bin/env node
/**
 * 本地静态服务 + 文件变更自动刷新
 * 用法: node dev-server.js [port]
 * 默认 http://127.0.0.1:8765/
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 8765;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8'
};

const INJECT = `
<script>
(function () {
  var es = new EventSource('/__livereload');
  var t = null;
  es.onmessage = function (e) {
    if (e.data === 'reload') {
      clearTimeout(t);
      t = setTimeout(function () { location.reload(); }, 300);
    }
  };
  es.onerror = function () { /* 浏览器会自动重连 */ };
})();
</script>
`;

const sseClients = new Set();

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(ROOT, cleaned === path.sep ? '' : cleaned);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

function broadcastReload() {
  for (const res of sseClients) {
    try { res.write('data: reload\n\n'); } catch (_) {}
  }
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/__livereload')) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write('data: connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  let filePath = safePath(req.url === '/' ? '/index.html' : req.url);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    if (st.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      let body = data;
      if (ext === '.html') {
        const html = data.toString('utf8');
        body = html.includes('</body>')
          ? html.replace('</body>', INJECT + '</body>')
          : html + INJECT;
      }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(body);
    });
  });
});

let debounce = null;
function onChange(file) {
  if (!file) return;
  const base = path.basename(file);
  if (base.startsWith('.') || base === 'dev-server.js') return;
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log('[reload]', path.relative(ROOT, file) || file);
    broadcastReload();
  }, 250);
}

function watch(dir) {
  try {
    fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (filename) onChange(path.join(dir, filename));
    });
  } catch (_) {
    fs.watch(dir, (_event, filename) => {
      if (filename) onChange(path.join(dir, filename));
    });
    for (const sub of ['js', 'css']) {
      const p = path.join(dir, sub);
      if (fs.existsSync(p)) {
        fs.watch(p, (_event, filename) => {
          if (filename) onChange(path.join(p, filename));
        });
      }
    }
  }
}

watch(ROOT);

server.listen(PORT, '127.0.0.1', () => {
  console.log('Warhammer dev server (auto-reload)');
  console.log('→ http://127.0.0.1:' + PORT + '/');
  console.log('Watching:', ROOT);
});
