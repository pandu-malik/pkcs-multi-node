const crypto = require('crypto');
const fs = require('fs');

const privateKeyPEM = fs.readFileSync("private.pem")
const dataToSign = 'This is the data to sign.';

const signer = crypto.createSign('SHA256');
signer.update(dataToSign);
const signature = signer.sign(privateKeyPEM, 'base64');

console.log('Signature:', signature);