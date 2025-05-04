const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// Generate a new key pair (for demonstration purposes - in a real application, you would manage keys securely) (ntar nyoba pake PEM dari Authority beneran)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});


fs.writeFileSync('private.pem', privateKey);

console.log('Public Key:\n', publicKey);
console.log('\nPrivate Key:\n', privateKey);

// Endpoint for public key encryption
app.post('/encrypt', (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Missing data to encrypt.' });
        }

        // const buffer = Buffer.from(data, 'utf8');
        // const encrypted = crypto.publicEncrypt(publicKey, buffer);

        const buffer = Buffer.from(data, 'utf8');
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );
        res.json({ encryptedData: encrypted.toString('base64') });
    } catch (error) {
        console.error('Encryption error:', error);
        res.status(500).json({ error: 'Encryption failed.' });
    }
});

// Endpoint for public key decryption
app.post('/decrypt', (req, res) => {
    try {
        const { encryptedData } = req.body;
        if (!encryptedData) {
            return res.status(400).json({ error: 'Missing data to decrypt.' });
        }

        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );
        res.json({ decryptedData: decrypted.toString('utf8') });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ error: 'Decryption failed.' });
    }
});

// Endpoint to verify digital signature
app.post('/verify-signature', (req, res) => {
    try {
        const { data, signature } = req.body;
        if (!data || !signature) {
            return res.status(400).json({ error: 'Missing data or signature.' });
        }

        const verifier = crypto.createVerify('SHA256');
        verifier.update(data);
        const isVerified = verifier.verify(publicKey, signature, 'base64');

        res.json({ isSignatureValid: isVerified });
    } catch (error) {
        console.error('Signature verification error:', error);
        res.status(500).json({ error: 'Signature verification failed.' });
    }
});

app.post('/sign-doc', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No document file provided.' });
    }

    const documentPath = req.file.path;
    let documentToSign;
    try {
        documentToSign = fs.readFileSync(documentPath, 'utf8');
    } catch (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Failed to read the document file.' });
    }
    console.log("Document to sign: ", documentToSign);
    const signer = crypto.createSign('SHA256');
    signer.update(documentToSign);
    const signature = signer.sign(privateKey, 'base64');

    if (signature) {
        // res.json({
        //     message: 'Document uploaded and signed successfully.',
        //     signature: signature,
        // });
        res.json({
            signature
        });
    } else {
        res.status(500).json({ error: 'Failed to sign the document.' });
    }
});

app.post('/verify-doc', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Missing document file.' });
    }

    const { signature } = req.body;
    if (!signature) {
        return res.status(400).json({ error: 'Missing signature.' });
    }

    let documentContent;
    try {
        documentContent = fs.readFileSync(req.file.path, 'utf8');
    } catch (error) {
        console.error('Error reading file:', error);
        return res.status(500).json({ error: 'Failed to read document file.' });
    }

    const verifier = crypto.createVerify('SHA256');
    verifier.update(documentContent);
    const isVerified = verifier.verify(publicKey, signature, 'base64');

    if (isVerified) {
        res.json({ message: 'Document signature is valid.' });
    } else {
        res.status(400).json({ error: 'Invalid document signature.' });
    }

    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).json({ error: 'Failed to delete the file.' });
        }
    });
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});