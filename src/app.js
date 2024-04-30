const express = require('express')
const app = express()
const port = 5000
const cors = require("cors");
const startScrape = require('./controller');

app.use(cors())

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.get('/gssg', async function(req, res) {
    try {
        const data = await startScrape();
        res.send(data);
    }
    catch (e) {
        res.send(e);
    }
});