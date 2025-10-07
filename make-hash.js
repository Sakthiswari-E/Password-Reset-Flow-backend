// backend/make-hash.js
const bcrypt = require('bcryptjs');

const plain = process.argv[2] || '123456';
const saltRounds = 10;

bcrypt.hash(plain, saltRounds, (err, hash) => {
  if (err) {
    console.error('Hash generation failed:', err);
    process.exit(1);
  }
  console.log(hash);
});
