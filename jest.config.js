export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  testMatch: [
    "<rootDir>/tests/Unit/**/*.test.js",
    "<rootDir>/tests/Unit/**/*.test.jsx",
    "<rootDir>/tests/Unit/**/*.test.cjs"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/E2E/",
    "/src/tests/"
  ],

  collectCoverage: true,

  collectCoverageFrom: [
    "src/Paginas/Login.jsx",
    "src/Paginas/Register.jsx",
    "src/Paginas/PasarelaPagos.jsx",
    "src/Paginas/CarritoCompras.jsx",
    "src/Paginas/dashboard.jsx",
    "src/Rutas/PrivateRoute.jsx",
    "src/Hooks/useAuth.jsx",
    "src/Context/MyContext.jsx",
    "src/utils/**/*.js",
    "Backend/server.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json"],

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },

  moduleNameMapper: {
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^.+\\.(jpg|jpeg|png|gif|svg|webp)$": "<rootDir>/tests/Unit/fileMock.cjs"
  }
};