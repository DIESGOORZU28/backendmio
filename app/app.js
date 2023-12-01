const express = require('express');

const cors = require('cors');

const connectToDatabase = require('./db');
const controllers = require('./controllers');
const verifyToken = require('./middlewares/verifyToken');
const stripe = require('stripe')('sk_test_51O5Gz0FqzLAtNtxMKvc4IiuLwwY8djJrjXVtuFiiI6oF7YNe0mOJPY3nRtHNrM1aVUT6bQth9SvKEfEBvUAwiMPG00FXcslwub'); // Coloca tu clave secreta de Stripe aquí

const app = express();

app.use(cors());
app.use(express.json());

// Rutas para el primer servidor
app.get('/user', verifyToken, controllers.getUserById);
app.post('/register', controllers.register);
app.post('/login', controllers.login);

// Rutas y configuración para el segundo servidor (Stripe)
app.use(express.static("public"));
app.post("/checkout", async (req, res) => {
  // Lógica para el segundo servidor (Stripe)
  const items = req.body.items;
  let arrayItems = [];
  items.forEach((item) => {
    arrayItems.push({
      price: item.id,
      quantity: item.quantity,
    });
  });

  // Lógica específica de Stripe para crear una sesión de checkout
  // Reemplaza con tu propia lógica de Stripe
  const session = await stripe.checkout.sessions.create({
    line_items: arrayItems,
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send(
    JSON.stringify({
      url: session.url,
    })
  );
});

// Conexión a la base de datos para el primer servidor
connectToDatabase();

// Inicio del servidor en el puerto 5000
const PORT1 = 5000;
app.listen(PORT1, () => {
  console.log(`Primer servidor funcionando en el puerto ${PORT1}`);
});

// Inicio del segundo servidor en el puerto 4000
const PORT2 = 4000;
app.listen(PORT2, () => {
  console.log(`Segundo servidor iniciado en el puerto ${PORT2}`);
});

module.exports = app;
