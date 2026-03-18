/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-components-import-server',
      comment:
        'Client-side code (components, utils) must not import from server; server is for Node/SSR only.',
      severity: 'error',
      from: { path: '^src/(components|utils)' },
      to: { path: '^src/server' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
