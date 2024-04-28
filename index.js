const express = require('express');
const speakeasy = require('speakeasy');
const QRcode = require('qrcode');

const app = express();
const port = 3000;

const secret = speakeasy.generateSecret({ length: 20 });
console.log(secret);

const user = {
    username: "test",
    secret: secret.base32
};
console.log(user);

app.use(express.json());

app.get('/qr', (req, res) => {
    const otpauth_url = speakeasy.otpauthURL({
        secret: user.secret,
        label: 'TAG',
        issuer: 'TAG'
    });

    console.log(otpauth_url);

    QRcode.toDataURL(otpauth_url, (err, data_url) => {
        if (err) {
            res.status(500).json({ message: 'Error generating QR code' });
        }
        else {
            res.send(`<img src="${data_url}" alt="QR code">`);
        }
    });
});

function generateToken() {
    console.log(speakeasy.totp({
        secret: user.secret,
        encoding: 'base32',
        step: 60
    }));
    setTimeout(generateToken, 20000); // 20 seconds delay
}

generateToken();

app.post('/verify', (req, res) => {
    const { token } = req.body;
    const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: token
    });

    console.log(verified);

    if (verified === true) {
        res.send({ "status": "DELA" });
    } else {
        res.send({ "status": "token is invalid" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
