const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/books');
const {sendError, sendNotFound} = require('./utils/response');
const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter); 
app.use('/api/auth', authRouter);
app.use('/', indexRouter);

app.use((req, res) => {
  sendNotFound(res, 'Route');
});

app.use((err, req, res, next) => {
  sendError(res, err.message || 'Internal Server Error', err.status || 500, err);
});

module.exports = app;
