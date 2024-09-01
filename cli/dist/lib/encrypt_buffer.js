import e from"crypto";const i=(a,n)=>{const t=e.randomBytes(16),c=e.createHash("sha256").update(n).digest("hex").substring(0,32),r=e.createCipheriv("aes256",c,t);return Buffer.concat([t,r.update(a),r.final()])};var s=i;export{s as default};
//# sourceMappingURL=encrypt_buffer.js.map
