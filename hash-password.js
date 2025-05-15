// hash-password.js
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Enter the password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    readline.close();
    return;
  }

  // The "salt round" determines how much time is needed to calculate a single bcrypt hash.
  // 10-12 is a common and generally secure range. Higher means more secure but slower.
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) {
      console.error('Error generating salt:', err);
      readline.close();
      return;
    }
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        console.error('Error hashing password:', err);
        readline.close();
        return;
      }
      console.log('\nPassword entered:', password); // For verification, remove in production scripts
      console.log('Generated Salt:', salt);         // Informational
      console.log('Hashed Password:', hash);        // <-- This is what you store in the database
      console.log('\nCopy the "Hashed Password" and store it in your admin table.');
      readline.close();
    });
  });
});