
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const motherRoutes = require('./routes/motherRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/mothers', motherRoutes);

app.get('/', (req, res) => res.send('Backend Running ✅'));
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
