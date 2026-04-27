export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
};