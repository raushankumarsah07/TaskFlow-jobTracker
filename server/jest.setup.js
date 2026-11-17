// This file runs before any test module is loaded
// Setting env vars here ensures they are available when config/env.js is first imported
process.env.JWT_ACCESS_SECRET = 'test_access_secret_12345_long_enough';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_12345_long_enough';
process.env.JWT_RESET_SECRET = 'test_reset_secret_12345_long_enough';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/taskflow_test';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error';
process.env.PORT = '5001';
