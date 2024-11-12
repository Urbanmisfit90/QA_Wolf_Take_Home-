module.exports = {
    presets: [
      '@babel/preset-env', // To handle ESM syntax
    ],
    plugins: [
      '@babel/plugin-transform-modules-commonjs', // Transforms modules for Jest compatibility
    ],
  };