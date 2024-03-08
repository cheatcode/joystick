import e from"../../../lib/timestamps.js";const n=async({database:s={},table:_="",seconds:a=0})=>{const i=(await s.query(`
		SELECT * FROM ${_} WHERE status = ANY($1) AND environment = $2
	`,[["completed","failed"],process.env.NODE_ENV]))?.filter((t={})=>t?.status==="completed"?e.get_future_time("seconds",a,{start_from:t?.completed_at})<=e.get_current_time():t?.status==="failed"?e.get_future_time("seconds",a,{start_from:t?.failed_at})<=e.get_current_time():!1);await s.query(`
		DELETE FROM ${_} WHERE _id = ANY($1)
	`,[i?.map(({_id:t})=>t)])};var u=n;export{u as default};
