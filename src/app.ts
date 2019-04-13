import express from 'express';


// var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app: express.Application = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// The port the express app will listen on
const port: any = process.env.PORT  || 3000;

app.get("/", (req, res) => res.render("graph.html"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// function getLinksFromSite(site) {
//   const page = await browser.newPage();
//   await page.goto(site);
//   const content = await page.content();
//   const $ = cheerio.load(content);
//   var links = $("a");
//   var linkModel = [];
//   links.each((i, link) => {
//     //   console.log(link);
//     linkModel.push($(link).text() + " : " + $(link).attr("href"));
//   });
//   return linkModel;
// }
