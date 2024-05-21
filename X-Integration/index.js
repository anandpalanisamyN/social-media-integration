require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

app.post('/post-to-twitter', async (req, res) => {
  try {
    const { text, imagePath } = req.body;

    if (!text || !imagePath) {
      return res.status(400).json({ error: 'Text and image path are required' });
    }

    const resolvedImagePath = path.resolve(imagePath);
    if (!fs.existsSync(resolvedImagePath)) {
      return res.status(400).json({ error: 'Image file does not exist' });
    }

    const imageData = fs.readFileSync(resolvedImagePath);
    const mimeType = mime.lookup(resolvedImagePath);
    if (!mimeType) {
      return res.status(400).json({ error: 'Could not determine MIME type' });
    }

    const mediaId = await client.v1.uploadMedia(imageData, { mimeType });
    const tweet = await client.v2.tweet({ text, media: { media_ids: [mediaId] } });

    res.status(200).json({ success: true, tweet: tweet.data });
  } catch (error) {
    console.error('Error posting tweet:', error);
    res.status(500).json({ error: 'Error posting tweet' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
