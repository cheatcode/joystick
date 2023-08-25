var o=(t=128,n="test.txt",e="text/plain")=>{let l=t instanceof Blob;return new File(l?t:new Blob(new Uint8Array(t||128),{type:e}),n,{type:e})};export{o as default};
