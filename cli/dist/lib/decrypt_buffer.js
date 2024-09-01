import c from"crypto";const a=(e,r)=>{const i=e.slice(0,16),s=e.slice(16),o=c.createHash("sha256").update(r).digest("hex").substring(0,32),t=c.createDecipheriv("aes256",o,i);return Buffer.concat([t.update(s),t.final()])};var p=a;export{p as default};
//# sourceMappingURL=decrypt_buffer.js.map
