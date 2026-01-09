import { createRequire } from "module";
const require = createRequire(import.meta.url);

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors())

app.get('/', (req, res) => {
      res.send('Hello from our server!')
})

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
      console.log(`server listening on port ${port}`)
})