const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');
const controllers = require('./controllers');
const verifyToken = require('./middlewares/verifyToken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

require('dotenv').config();

const app = express();

// Configuración de CORS para permitir solicitudes desde el frontend (Vercel)
const corsOptions = {
  origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(express.json());

// Rutas para el primer servidor
app.get('/user', verifyToken, controllers.getUserById);
app.post('/register', controllers.register);
app.post('/login', controllers.login);

// Conexión a la base de datos para el primer servidor
connectToDatabase();

// Inicio del servidor en el puerto especificado en el archivo .env o en el puerto 5000 por defecto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Primer servidor funcionando en el puerto ${PORT}`);
});

// Crear una segunda instancia de Express para el segundo servidor (Stripe)
const appStripe = express();

// Configuración de CORS para el segundo servidor (Stripe)
const corsOptionsStripe = {
  origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
  methods: "POST",
  credentials: true,
  optionsSuccessStatus: 204,
};
appStripe.use(cors(corsOptionsStripe));

// Rutas para el segundo servidor (Stripe)
appStripe.use(express.static("public"));
appStripe.post("/checkout", async (req, res) => {
  try {
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
    const session = await stripe.checkout.sessions.create({
      line_items: arrayItems,
      mode: "payment",
      success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/success",
      cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel",
    });

    res.send(
      JSON.stringify({
        url: session.url,
      })
    );
  } catch (error) {
    console.error("Error en la lógica de Stripe:", error);
    res.status(500).send({ error: "Error en la lógica de Stripe" });
  }
});

// Inicio del segundo servidor en el puerto especificado en el archivo .env o en el puerto 4000 por defecto
const PORT_STRIPE = process.env.PORT_STRIPE || 4000;
appStripe.listen(PORT_STRIPE, () => {
  console.log(`Segundo servidor iniciado en el puerto ${PORT_STRIPE}`);
});

module.exports = app;
