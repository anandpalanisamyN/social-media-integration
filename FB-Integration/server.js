const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/post-to-facebook", async (req, res) => {
    try {
        const { message, access_token, link } = req.body;
        const { FACEBOOK_PAGE_ID: facebookPageId, FACEBOOK_GRAPHAPI_BASE_PATH: basePath } = process.env;

        let apiUrl = `https://${basePath}/${facebookPageId}/photos?access_token=${access_token}`;

        const params = new URLSearchParams();
        if (message) params.append('message', message);
        if (link) params.append('url', link);

        apiUrl += `&${params.toString()}`;

        await axios.post(apiUrl);

        res.status(200).send("Posted successfully");
    } catch (error) {
        console.error("Error posting to Facebook:", error.response ? error.response.data : error.message);
        res.status(500).send("Error posting to Facebook");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
