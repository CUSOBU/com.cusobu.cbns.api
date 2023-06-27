import crypto from 'crypto';
import {config} from '../config/config';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16); // IV debe ser de 16 bytes

// Encriptar y desencriptar txt
export const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, config.SECRET_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (encryptedText:string) => {
    let [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(algorithm, config.SECRET_KEY, Buffer.from(iv, 'hex'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);

    return decrypted.toString();
};


export default {
    encrypt,
    decrypt
}