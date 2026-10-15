// ═══════════════════════════════════════════════
//  Client minimal vers l'API Growth'Lib v1 (Liberall-OS, déployée sur Render).
//  Un seul point d'entrée HTTP — tous les outils MCP passent par ici, jamais
//  d'appel fetch direct ailleurs : un seul endroit où la clé est injectée.
// ═══════════════════════════════════════════════

const BASE_URL = process.env.GROWTHLIB_API_URL || 'https://liberall-os.onrender.com';

function cle() {
  const k = process.env.GROWTHLIB_API_KEY;
  if (!k) throw new Error('GROWTHLIB_API_KEY absente — voir mcp/README.md pour la configuration.');
  return k;
}

async function appel(method, path, { query, body } = {}) {
  let url = BASE_URL + path;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += '?' + qs;
  }
  const opts = {
    method,
    headers: { Authorization: `Bearer ${cle()}`, 'content-type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // On remonte le message de l'API tel quel (déjà pédagogique côté Liberall-OS :
    // 429 budget d'écriture, 403 scope manquant, 422 validation...) plutôt que
    // de le masquer derrière une erreur générique.
    const msg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

const get = (path, query) => appel('GET', path, { query });
const post = (path, body) => appel('POST', path, { body });
const patch = (path, body) => appel('PATCH', path, { body });

module.exports = { get, post, patch, BASE_URL };
