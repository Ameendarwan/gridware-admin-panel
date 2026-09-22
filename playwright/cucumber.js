module.exports = {
  default: {
    require: [
      'features/step-definitions/**/*.ts', // ✅ MATCH THIS
      'features/support/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    paths: ['features/**/*.feature'],
    format: ['progress'],
    timeout: 120000,
    stepTimeout: 120000,
  },
};
