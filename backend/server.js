const express = require('express');
const app = express();


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Webify Backend is running!');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});