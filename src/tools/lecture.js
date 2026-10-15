// ═══════════════════════════════════════════════
//  Outils de LECTURE — un par route GET existante de l'API v1. Aucune
//  confirmation requise : rien n'est modifié.
// ═══════════════════════════════════════════════

const { z } = require('zod');
const api = require('../api-client');

function enregistrer(server) {
  server.registerTool('whoami', {
    title: 'Qui suis-je',
    description: "Identité et portées (scopes) de la clé API Growth'Lib utilisée — à appeler en cas de doute avant une action qui pourrait être refusée.",
    inputSchema: {},
  }, async () => texte(await api.get('/v1/me')));

  server.registerTool('get_usage', {
    title: "Quota d'écriture restant",
    description: "Combien d'écritures restent sur le budget 200/24h de cette clé — à vérifier avant une série d'actions.",
    inputSchema: {},
  }, async () => texte(await api.get('/v1/usage')));

  server.registerTool('list_contacts', {
    title: 'Lister les contacts du CRM',
    description: "Cherche/filtre les contacts du CRM Growth'Lib (périmètre : toute l'organisation, comme le dashboard web).",
    inputSchema: {
      q: z.string().optional().describe('Recherche texte libre (nom, entreprise...)'),
      phase: z.string().optional().describe('Phase(s) CSV, ex: "qualify,suivi"'),
      tags: z.string().optional().describe('Tag(s) CSV'),
      company: z.string().optional(),
      min_score: z.number().int().optional(),
      updated_since: z.string().optional().describe('Date ISO 8601'),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional().describe('Pour la page suivante (next_cursor de la réponse précédente)'),
    },
  }, async (a) => texte(await api.get('/v1/contacts', a)));

  server.registerTool('get_contact', {
    title: 'Fiche complète d\'un contact',
    description: 'Contact + ses interactions + ses campagnes, en un seul appel.',
    inputSchema: { id: z.number().int().describe('ID du contact') },
  }, async ({ id }) => texte(await api.get(`/v1/contacts/${id}`)));

  server.registerTool('list_interactions', {
    title: 'Lister les interactions',
    description: "Historique d'interactions (notes, vues, likes, invitations envoyées/acceptées...) — filtrable par contact.",
    inputSchema: {
      contact_id: z.number().int().optional(),
      type: z.string().optional(),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional(),
    },
  }, async (a) => texte(await api.get('/v1/interactions', a)));

  server.registerTool('list_linkedin_accounts', {
    title: "Comptes LinkedIn de l'organisation",
    description: "Liste les comptes LinkedIn connectés (id/label/status/profile_url — jamais de cookies/mot de passe).",
    inputSchema: {},
  }, async () => texte(await api.get('/v1/linkedin-accounts')));

  server.registerTool('list_campaigns', {
    title: 'Lister les campagnes',
    description: 'Campagnes de prospection avec leurs compteurs (to_send/sent_waiting/accepted/replied/failed).',
    inputSchema: {
      status: z.string().optional(),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional(),
    },
  }, async (a) => texte(await api.get('/v1/campaigns', a)));

  server.registerTool('list_campaign_contacts', {
    title: "Contacts d'une campagne",
    description: "Contacts d'une campagne, filtrables par état (to_send, sent_waiting, accepted, replied, failed).",
    inputSchema: {
      campaign_id: z.number().int(),
      state: z.enum(['to_send', 'sent_waiting', 'accepted', 'replied', 'failed']).optional(),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional(),
    },
  }, async (a) => texte(await api.get('/v1/campaign-contacts', a)));

  server.registerTool('list_contact_activity', {
    title: 'Publications des contacts (veille quotidienne)',
    description: "Publications LinkedIn des contacts du CRM, scrapées quotidiennement, avec leur statut de traitement. "
      + "C'est ici qu'on trouve le `post_url` à passer ensuite à like_post/comment_post. "
      + "status='new' = jamais traité, 'irrelevant' = écarté, 'done' = déjà traité (liké/commenté ou jugé suffisant).",
    inputSchema: {
      status: z.enum(['new', 'irrelevant', 'done']).optional().describe("Défaut : toutes. Utiliser 'new' pour la revue hebdomadaire."),
      contact_id: z.number().int().optional(),
      since: z.string().optional().describe('Date ISO 8601'),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional(),
    },
  }, async (a) => texte(await api.get('/v1/contact-activity', a)));

  server.registerTool('list_workflows', {
    title: 'Lister les workflows',
    description: "Workflows Growth'Lib existants (nom, activé/désactivé, étapes).",
    inputSchema: {},
  }, async () => texte(await api.get('/v1/workflows')));

  server.registerTool('list_workflow_runs', {
    title: "Historique d'exécution des workflows",
    description: 'Runs passés/en cours, filtrables par workflow ou par statut.',
    inputSchema: {
      workflow_id: z.number().int().optional(),
      status: z.string().optional(),
      limit: z.number().int().optional(),
      cursor: z.number().int().optional(),
    },
  }, async (a) => texte(await api.get('/v1/workflow-runs', a)));
}

function texte(objet) {
  return { content: [{ type: 'text', text: JSON.stringify(objet, null, 2) }] };
}

module.exports = { enregistrer, texte };
