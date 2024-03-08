const handle_cleanup_sessions = async () => {
	await process.databases._sessions.query(`DELETE FROM sessions where created_at::timestamp <= timezone('utc', now() - interval '1 hour')`);
};

export default handle_cleanup_sessions;
