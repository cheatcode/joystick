import dayjs from 'dayjs';
import generateId from "../../../../lib/generateId";

export default {
	create_session: async () => {
		const session_id = generateId();
		await process.databases._sessions?.collection('sessions').insertOne({
			_id: session_id,
			csrf: generateId(32),
			createdAt: new Date(new Date().toISOString()),
		});
		return session_id;
	},
	get_session: async (input = {}) => {
		return process.databases._sessions?.collection('sessions').findOne({
			_id: input?.session_id,
		});
	},
};
