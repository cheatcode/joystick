const detect_device_type = (req = {}) => {
  const user_agent = req.headers['user-agent'] || '';

  const handheld_regex = /Mobile|Android|iPhone|iPod|BlackBerry|Windows Phone/i;
  const tablet_regex = /Tablet|iPad/i;

  if (tablet_regex.test(user_agent)) {
    return 'tablet';
  }

  if (handheld_regex.test(user_agent)) {
    return 'handheld';
  }

  return 'desktop';
};

export default detect_device_type;