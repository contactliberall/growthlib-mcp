#!/usr/bin/env node
// ═══════════════════════════════════════════════
//  Serveur MCP Growth'Lib — transport stdio, pour Claude Desktop/Claude Code.
//  Enveloppe l'API v1 déjà déployée (Liberall-OS sur Render) ; aucune logique
//  métier ici, juste des outils écrits à la main (pas générés) avec leurs
//  garde-fous (confirm+reason sur toute action réelle, pas de suppression,
//  pas de création de workflow — voir README.md pour le détail des choix).
// ═══════════════════════════════════════════════

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const pkg = require('../package.json');

async function main() {
  if (!process.env.GROWTHLIB_API_KEY) {
    console.error("GROWTHLIB_API_KEY absente — voir mcp/README.md. Le serveur démarre quand même pour que Claude Desktop affiche l'erreur plutôt que rien.");
  }

  const server = new McpServer({ name: 'growthlib-mcp', version: pkg.version });

  require('./tools/lecture').enregistrer(server);
  require('./tools/ecriture').enregistrer(server);
  require('./tools/actions-linkedin').enregistrer(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error('growthlib-mcp : erreur fatale au démarrage —', e.message);
  process.exit(1);
});
