const mongoose = require('mongoose');
const { DB_USER, DB_PASSWORD, DB_HOST } = require('./constants.js');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/rutamagica?retryWrites=true&w=majority`, {
      useNewUrlParser: false, 
      useUnifiedTopology: true,
    });
    console.log('La conexión fue un gran éxito');
  } catch (error) {
    console.error('Error en la conexión a la base de datos:', error);
  }
};

module.exports = connectToDatabase;
