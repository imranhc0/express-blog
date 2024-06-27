// jest.config.js or package.json

module.exports = {
    // other Jest configurations
    transformIgnorePatterns: [
      '/node_modules/(?!(bson)/)'  // Adjust this pattern based on your specific needs
    ],
    transform: {
      '^.+\\.js$': 'babel-jest',   // Ensure proper JS transformation
    },
    "setupFilesAfterEnv": [
      "./jest.setup.js"
    ]
  };
  