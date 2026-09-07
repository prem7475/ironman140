const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'c796dcce552f6054ab5906ae99c6c675369b063b957aaf66467566ba15a5682c';

const userPayload = {
  user: {
    id: '66e01a2b3c4d5e6f7a8b9c0d',
    role: 'USER'
  }
};

const adminPayload = {
  user: {
    id: '66e01a2b3c4d5e6f7a8b9c0e',
    role: 'ADMIN'
  }
};

const userToken = jwt.sign(userPayload, secret, { expiresIn: '30d' });
const adminToken = jwt.sign(adminPayload, secret, { expiresIn: '30d' });

console.log('--- PACEFORGE JWT TOKENS ---');
console.log('USER_TOKEN:', userToken);
console.log('ADMIN_TOKEN:', adminToken);
