import t from"../../../lib/timestamps.js";const n=async({database:e={},table:s="",seconds:m=0})=>{const o=(await e.query(`
    SELECT * FROM ${s} WHERE status = ANY($1) AND environment = $2
  `,[["completed","failed"],process.env.NODE_ENV]))?.filter((_={})=>{if(_?.status==="completed"){const r=t.get_future_time("seconds",m,{start_from:_?.completed_at,format:t.get_database_format(e)}),a=t.get_current_time({format:t.get_database_format(e)});return new Date(r).getTime()<=new Date(a).getTime()}if(_?.status==="failed"){const r=t.get_future_time("seconds",m,{start_from:_?.failed_at,format:t.get_database_format(e)}),a=t.get_current_time({format:t.get_database_format(e)});return new Date(r).getTime()<=new Date(a).getTime()}return!1});await e.query(`
    DELETE FROM ${s} WHERE _id = ANY($1)
  `,[o?.map(({_id:_})=>_)])};var c=n;export{c as default};
