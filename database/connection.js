const mongoose = require('mongoose')
require('dotenv').config();

const connection = async()=>{
    try {
        //await mongoose.connect(process.env.MONGODB_URI,)
        await mongoose.connect('mongodb://localhost:27017/Blog2')
        console.log("Connection success BD")
        
    } catch (error) {
        console.log(error);
        console.log('Intentando nuevamente la conexión en 2 segundos...');
        setTimeout(connection, 2000);
        
    }
}


module.exports={
    connection
}