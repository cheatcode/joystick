import o from"node-fetch";var r=(t="")=>o(`http://localhost:${process.env.PORT}/api/_test/accounts`,{method:"DELETE",mode:"cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t}),cache:"no-store"});export{r as default};
