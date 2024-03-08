import generate_id from "../../../../lib/generate_id.js";

const sessions = {
	create_session: async () => {
		const session_id = generate_id(16);
		
		await process.databases._sessions?.collection('sessions').insertOne({
			_id: session_id,
			csrf: generate_id(32),
			created_at: new Date(new Date().toISOString()),
		});

		return session_id;
	},
	get_session: async (input = {}) => {
		return process.databases._sessions?.collection('sessions').findOne({
			_id: input?.session_id,
		});
	},
};

export default sessions;
