export const generateWildcard = (query: string, path: string) => ({
  wildcard: {
    query: `*${query}*`,
    path: `${path}`,
    allowAnalyzedField: true,
  },
});
