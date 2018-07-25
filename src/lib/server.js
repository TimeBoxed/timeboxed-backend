const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World, we are Timeboxed!'));

app.listen(3000, () => console.log('Timeboxed App listening on port 3000!'));
