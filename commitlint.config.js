module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-with-custom-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'subject-with-custom-format': (parsed) => {
          const { subject } = parsed;
          const format = /\s*\[\w+\]\s\w+.*/;

          if (!format.test(subject)) {
            return [false, 'subject must be following format: "[id-task|action] comment"'];
          }

          return [true];
        },
      },
    },
  ],
};
