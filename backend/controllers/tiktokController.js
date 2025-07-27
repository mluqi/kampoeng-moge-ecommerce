require('dotenv').config();
const { integration_tokens:TiktokToken } = require('../models');

exports.saveInitialToken = async (req, res) => {
  const { access_token, refresh_token, access_token_expire_in, refresh_token_expire_in } = req.body;

  if (!access_token || !refresh_token || !access_token_expire_in || !refresh_token_expire_in) {
    return res.status(400).json({ message: 'All token fields are required: access_token, refresh_token, access_token_expire_in, refresh_token_expire_in.' });
  }

  try {
    const expires_at = (parseInt(access_token_expire_in, 10) - 300) * 1000; // 5 min buffer
    const refresh_expires_at = (parseInt(refresh_token_expire_in, 10) - 86400) * 1000; // 1 day buffer


    await TiktokToken.upsert({
      access_token,
      refresh_token,
      expires_at,
      refresh_expires_at,
    });

    res.status(200).json({ message: 'TikTok token saved successfully.' });
  } catch (error) {
    console.error('Error saving TikTok token:', error);
    res.status(500).json({ message: 'Failed to save TikTok token.', details: error.message });
  }
};

