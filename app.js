const express = require('express');
const app = express();
const port = 3000;
app.use(express.static('wwwroot'))
app.get('/', (req, res) => res.redirect('/chart.html'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))