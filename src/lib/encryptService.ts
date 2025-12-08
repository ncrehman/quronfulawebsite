import crypto from "crypto-js";

const key: any = crypto.enc.Utf8.parse("storyrehman$&_mo"); 
const initv: any = crypto.enc.Utf8.parse("storyrehmannmoti"); 


export function encryptText(text: string): string {
  return crypto.AES.encrypt(text, key).toString();
}

export function decryptText(cipherText: string): string {
  const bytes = crypto.AES.decrypt(cipherText, key);
  return bytes.toString(crypto.enc.Utf8);
}

export async function decryptData(data: any) {
  const decrypted = crypto.AES.decrypt(data, key, {
    keySize: 128 / 8,
    iv: initv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7
  });
  return decrypted.toString(crypto.enc.Utf8);
}
export async function encryptData(data: any) {
  var encrypted = crypto.AES.encrypt(crypto.enc.Utf8.parse(data), key,
    {
      keySize: 128 / 8,
      iv: initv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7
    });
  return encrypted.toString();
}

