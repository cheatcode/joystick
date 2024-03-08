import generate_id from "../../../../lib/generate_id.js";

const sessions = {
	create_session: async (input = {}) => {
		const session_id = generate_id();

		await process.databases._sessions?.query(`
			INSERT INTO
				sessions (
					session_id,
					csrf,
					created_at
				)
			VALUES ($1, $2, $3)
		`, [
			session_id,
			generate_id(32),
			new Date().toISOString(),
		]);

		return session_id;
	},
	get_session: async (input = {}) => {
		const [session] = await process.databases._sessions?.query(`
			SELECT * FROM
				sessions
			WHERE
				session_id = $1
		`, [
			input?.session_id,
		]);

		return session;
	},
};

export default sessions;
