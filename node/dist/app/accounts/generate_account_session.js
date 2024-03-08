import t from"../../lib/generate_id.js";var r=()=>{const e=new Date;return e.setDate(e.getDate()+30),{token:t(64),token_expires_at:e}};export{r as default};
