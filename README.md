# Growth'Lib MCP

Serveur MCP (stdio) pour piloter [Growth'Lib](https://prismatic-cobbler-7340b9.netlify.app) depuis **Claude Desktop** ou **Claude Code**.

Ne fonctionne pas dans ChatGPT / un GPT personnalisé — MCP est le protocole d'Anthropic.

## Installation

1. **Clone ce dépôt** (ou télécharge-le en zip via le bouton vert "Code" sur GitHub) :
   ```
   git clone https://github.com/contactliberall/growthlib-mcp.git
   ```
2. **Installe les dépendances** :
   ```
   cd growthlib-mcp
   npm install
   ```
3. **Génère ta clé API Growth'Lib** : dans le dashboard → **Paramètres → API & Webhooks** → **Nouvelle clé**. Scopes recommandés : `contacts:read`, `contacts:write`, `actions:write`, `jobs:write`. Copie-la immédiatement (elle ne s'affiche qu'une fois).
4. **Configure Claude Desktop** — ouvre `claude_desktop_config.json` :
   - Windows : `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac : `~/Library/Application Support/Claude/claude_desktop_config.json`

   Et ajoute (en fusionnant avec ce qui existe déjà) :
   ```json
   {
     "mcpServers": {
       "growthlib": {
         "command": "node",
         "args": ["CHEMIN_ABSOLU_VERS_growthlib-mcp/src/server.js"],
         "env": { "GROWTHLIB_API_KEY": "glk_live_..." }
       }
     }
   }
   ```
5. **Redémarre Claude Desktop.** Les outils `growthlib` apparaissent dans Réglages → Developer.

## Outils exposés (21)

**Lecture** : `whoami`, `get_usage`, `list_contacts`, `get_contact`, `list_interactions`, `list_linkedin_accounts`, `list_campaigns`, `list_campaign_contacts`, `list_contact_activity`, `list_workflows`, `list_workflow_runs`.

**Écriture CRM** : `create_contact`, `add_interaction`, `mark_contact_activity`, `update_contact` (confirm+reason), `run_workflow` (confirm+reason).

**Actions LinkedIn réelles** (toutes confirm+reason) : `send_invite`, `send_message`, `visit_profile`, `like_post`, `comment_post`.

## Garde-fous

- Aucun outil de suppression. Aucun outil de création de workflow.
- Toute action à effet réel exige `confirm: true` + `reason` — sinon refus explicite.
- Les quotas (budget d'écriture, limites LinkedIn) sont appliqués par l'API elle-même.

## Mises à jour

Ce dépôt est synchronisé manuellement depuis le code source (interne). Pour mettre à jour : `git pull` puis `npm install` à nouveau si `package.json` a changé.
