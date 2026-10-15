// ═══════════════════════════════════════════════
//  Garde-fous communs aux outils d'écriture/action — pas de fuite d'effet de
//  bord « gratuit » : toute action réelle exige confirm+reason, et une erreur
//  de l'API est renvoyée telle quelle au modèle (429 budget, 403 scope...)
//  plutôt que masquée.
// ═══════════════════════════════════════════════

function texte(objet) {
  return { content: [{ type: 'text', text: JSON.stringify(objet, null, 2) }] };
}

function erreur(message) {
  return { content: [{ type: 'text', text: message }], isError: true };
}

// À utiliser au début de tout callback d'outil qui agit réellement (écrit en
// base ou déclenche LinkedIn). Retourne un message d'erreur SI l'appel doit
// être refusé (confirm absent ou reason vide), sinon null.
function exigerConfirmation(confirm, reason) {
  if (confirm !== true) {
    return "Refusé : passe `confirm: true` pour confirmer cette action réelle (elle a un effet visible — CRM ou LinkedIn).";
  }
  if (!reason || !String(reason).trim()) {
    return 'Refusé : `reason` est obligatoire — explique en une phrase pourquoi cette action est faite.';
  }
  return null;
}

async function executer(fn) {
  try {
    return texte(await fn());
  } catch (e) {
    return erreur(`${e.message}${e.status ? ` (HTTP ${e.status})` : ''}`);
  }
}

module.exports = { texte, erreur, exigerConfirmation, executer };
