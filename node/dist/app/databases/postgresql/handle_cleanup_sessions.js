const s=async()=>{await process.databases._sessions.query("DELETE FROM sessions where created_at::timestamp <= timezone('utc', now() - interval '1 hour')")};var e=s;export{e as default};
