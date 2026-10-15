// ═══════════════════════════════════════════════
//  Outils d'ACTION réelle sur LinkedIn — tous exigent confirm:true + reason.
//  Chaque outil cible UNE personne/UN post par appel (jamais un tableau) :
//  une approbation Claude Desktop = une action, jamais une rafale silencieuse.
//  Respectent les mêmes quotas/espacements qu'une action manuelle ou un
//  workflow — rien de spécifique au MCP, c'est l'API qui les applique.
// ═══════════════════════════════════════════════

const { z } = require('zod');
const api = require('../api-client');
const { erreur, exigerConfirmation, executer } = require('./garde-fous');

function enregistrer(server) {
  server.registerTool('send_invite', {
    title: 'Envoyer une invitation LinkedIn',
    description: "Envoie une invitation de connexion à un profil LinkedIn, depuis le compte de l'organisation. Action réelle et visible — exige confirm:true + reason.",
    inputSchema: {
      profileUrl: z.string().describe('URL du profil, format https://www.linkedin.com/in/...'),
      note: z.string().max(300).optional().describe("Message joint à l'invitation (optionnel)"),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ profileUrl, note, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/actions/invite', { profileUrl, note }));
  });

  server.registerTool('send_message', {
    title: 'Envoyer un message LinkedIn',
    description: 'Envoie un message direct à une relation LinkedIn existante. Action réelle et visible — exige confirm:true + reason.',
    inputSchema: {
      profileUrl: z.string(),
      text: z.string().min(1).max(1900),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ profileUrl, text, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/actions/message', { profileUrl, text }));
  });

  server.registerTool('visit_profile', {
    title: 'Visiter un profil LinkedIn',
    description: 'Visite un profil (laisse une trace "a consulté votre profil" côté LinkedIn). Exige confirm:true + reason.',
    inputSchema: {
      profileUrl: z.string(),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ profileUrl, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/actions/visit', { profileUrl }));
  });

  server.registerTool('like_post', {
    title: 'Liker une publication LinkedIn',
    description: 'Ajoute un like public sur une publication. Exige confirm:true + reason.',
    inputSchema: {
      postUrl: z.string().describe('URL du post, format .../feed/update/urn:li:activity:.../'),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ postUrl, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/actions/like', { postUrl }));
  });

  server.registerTool('comment_post', {
    title: 'Commenter une publication LinkedIn',
    description: 'Publie un commentaire public sous une publication. Exige confirm:true + reason.',
    inputSchema: {
      postUrl: z.string(),
      text: z.string().min(1).max(1250),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ postUrl, text, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/actions/comment', { postUrl, text }));
  });
}

module.exports = { enregistrer };
