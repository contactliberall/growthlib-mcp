// ═══════════════════════════════════════════════
//  Outils d'ÉCRITURE sur le CRM — update_contact et run_workflow exigent
//  confirm+reason (ils touchent l'état réel ou déclenchent une exécution).
//  create_contact et add_interaction (note) sont des annotations à faible
//  risque, pas de confirmation exigée — cohérent avec ce que l'API elle-même
//  autorise déjà (elle refuse les types d'interaction "preuve d'action").
// ═══════════════════════════════════════════════

const { z } = require('zod');
const api = require('../api-client');
const { texte, erreur, exigerConfirmation, executer } = require('./garde-fous');

const PHASES = ['hors_reseau', 'invite_envoyee', 'qualify', 'suivi', 'solliciter',
  'sollicite', 'relance', 'gagne', 'perdu', 'hors_cible', 'reseau', 'erreur'];
const TYPES_INTERACTION = ['note', 'view', 'like', 'comment', 'event', 'message'];

function enregistrer(server) {
  server.registerTool('create_contact', {
    title: 'Créer un contact CRM',
    description: "Crée une fiche contact. Si l'URL LinkedIn existe déjà dans l'organisation, renvoie la fiche existante (pas de doublon créé).",
    inputSchema: {
      name: z.string().describe('Obligatoire'),
      linkedin: z.string().optional(),
      role: z.string().optional(),
      company: z.string().optional(),
      headline: z.string().optional(),
      sector: z.string().optional(),
      location: z.string().optional(),
      phase: z.enum(PHASES).optional(),
      score: z.number().int().min(0).max(100).optional(),
      tags: z.array(z.string()).max(20).optional(),
      notes: z.string().optional(),
      segment: z.string().optional(),
    },
  }, async (a) => executer(() => api.post('/v1/contacts', a)));

  server.registerTool('update_contact', {
    title: 'Modifier un contact CRM',
    description: 'Met à jour une fiche existante (champs fournis seulement). Exige confirm:true + reason.',
    inputSchema: {
      id: z.number().int(),
      confirm: z.boolean().describe('true obligatoire pour que ça s\'applique'),
      reason: z.string().describe('Pourquoi ce changement, en une phrase'),
      name: z.string().optional(),
      linkedin: z.string().optional(),
      role: z.string().optional(),
      company: z.string().optional(),
      headline: z.string().optional(),
      sector: z.string().optional(),
      location: z.string().optional(),
      phase: z.enum(PHASES).optional(),
      score: z.number().int().min(0).max(100).optional(),
      tags: z.array(z.string()).max(20).optional(),
      notes: z.string().optional(),
      segment: z.string().optional(),
    },
  }, async ({ id, confirm, reason, ...patch }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.patch(`/v1/contacts/${id}`, patch));
  });

  server.registerTool('add_interaction', {
    title: 'Ajouter une interaction (annotation)',
    description: `Pose une annotation sur un contact. Types acceptés UNIQUEMENT : ${TYPES_INTERACTION.join(', ')}. `
      + "Les types « preuve d'action » (invite_sent, invite_accepted, dm_sent...) sont réservés au worker Growth'Lib et seront refusés — "
      + 'ne pas essayer de les forger ici, utiliser send_invite/send_message pour une vraie action LinkedIn.',
    inputSchema: {
      contact_id: z.number().int(),
      type: z.enum(TYPES_INTERACTION).default('note'),
      note: z.string().optional(),
      date: z.string().optional().describe('AAAA-MM-JJ, défaut = aujourd\'hui'),
    },
  }, async (a) => executer(() => api.post('/v1/interactions', a)));

  server.registerTool('mark_contact_activity', {
    title: 'Marquer une publication de contact comme traitée',
    description: "Change le statut d'une publication (new/irrelevant/done) après revue — pour qu'elle ne revienne pas la prochaine fois. "
      + 'Pas de confirmation requise : effet réversible, sans impact LinkedIn (contrairement à like_post/comment_post).',
    inputSchema: {
      id: z.number().int(),
      status: z.enum(['new', 'irrelevant', 'done']),
    },
  }, async (a) => executer(() => api.patch(`/v1/contact-activity/${a.id}`, { status: a.status })));

  server.registerTool('run_workflow', {
    title: 'Lancer un workflow existant maintenant',
    description: "Déclenche l'exécution immédiate d'un workflow déjà configuré dans Growth'Lib (ne crée JAMAIS de nouveau workflow — capacité volontairement non exposée). Exige confirm:true + reason.",
    inputSchema: {
      workflow_id: z.number().int(),
      confirm: z.boolean(),
      reason: z.string(),
    },
  }, async ({ workflow_id, confirm, reason }) => {
    const refus = exigerConfirmation(confirm, reason);
    if (refus) return erreur(refus);
    return executer(() => api.post('/v1/workflow-runs', { workflow_id }));
  });
}

module.exports = { enregistrer };
