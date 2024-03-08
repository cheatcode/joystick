import n from"../../../../lib/generate_id.js";const i={create_session:async(e={})=>{const s=n();return await process.databases._sessions?.query(`
			INSERT INTO
				sessions (
					session_id,
					csrf,
					created_at
				)
			VALUES ($1, $2, $3)
		`,[s,n(32),new Date().toISOString()]),s},get_session:async(e={})=>{const[s]=await process.databases._sessions?.query(`
			SELECT * FROM
				sessions
			WHERE
				session_id = $1
		`,[e?.session_id]);return s}};var t=i;export{t as default};
