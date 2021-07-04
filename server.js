const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('DB connection successfully established');
}).catch(err => console.log(err));

const server = app.listen(process.env.PORT, () => {
    console.log(`Starting JustResults Api in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on port ${process.env.PORT}`);
});

