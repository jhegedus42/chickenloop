const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { Request, Response, Headers, fetch } = require('undici');

global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.fetch = fetch;

// Set dummy env vars to satisfy import-time checks in lib/db.ts
process.env.MONGODB_URI = 'mongodb://localhost:27017/chickenloop-test-initial';
process.env.JWT_SECRET = 'test-jwt-secret';
