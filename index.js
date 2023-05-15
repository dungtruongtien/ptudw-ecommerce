const express = require("express");
const expressHandlebars = require("express-handlebars");
const { createStarList } = require("./controllers/handlebarsHelper")
const { createPagination } = require('express-handlebars-paginate')

const app = express();

const port = process.env.PORT || 8080;

//Public folder
app.use(express.static(__dirname + '/public'));
app.engine('hbs', expressHandlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  extname: 'hbs',
  defaultLayout: 'layout',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  },
  helpers: {
    createStarList,
    createPagination
  }
}))
app.set('view engine', 'hbs')

//Routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send('Internal Server Error');
});

app.use((req, res, next) => {
  res.status(400).render('error', { message: 'File not found' });
});

app.listen(port, () => {
  console.log(`Server is starting at ${port}`)
}) 