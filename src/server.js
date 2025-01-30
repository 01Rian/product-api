const express = require('express');
const productRoutes = require('./Controller/productController')
const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/products', productRoutes);

app.listen(port, () => {
  console.log('listening on port:', port);
});