module.exports = {
  //Type check TypeScript files
  'src/**/*.(ts|tsx)': () => 'yarn tsc --p tsconfig.json --noEmit',
  // Lint then format TypeScript and JavaScript files
  'src/**/*.(ts|tsx|js)': (filenames) => [`yarn eslint --fix .`, `yarn prettier --write ${filenames.join(' ')}`],
  // Format MarkDown and JSON
  '**/*.(md|json)': (filenames) => `yarn prettier --write ${filenames.join(' ')}`,
};
