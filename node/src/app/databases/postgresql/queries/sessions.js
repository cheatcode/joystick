import dayjs from 'dayjs';
import generateId from "../../../../lib/generateId";

export default {
	create_session: async (input = {}) => {
		const session_id = generateId();

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
			generateId(32),
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
	delete_expired_sessions: async () => {
    return process.databases.postgresql.query(`
			DELETE FROM sessions WHERE created_at::timestamp < $1
		`, [
			dayjs().subtract(1, 'hour').format(),
		]);
	},
};
