//importar dependencia de conexion
const {connection} = require("./database/connection");
const express = require("express");
const cors = require ("cors")


console.log("API Connection success")
// efectuar conexion a BD
connection();

const app = express();
const puerto = 4000;

//configurar cors
app.use(cors());

//conertir los datos del body a obj js
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//cargar rutas
const UserRoutes = require("./routes/user")
const ArticuloRoutes = require("./routes/articulo")
const ComentarioRoutes = require("./routes/comentario")
const RecoveryRouter = require("./routes/recovery")
const ProyectoRouter = require("./routes/proyecto")
const CategoriaRoutes = require("./routes/categoria")
const RedesRouter = require("./routes/redes")
const StackRouter = require("./routes/stack")



app.use("/api/user" ,UserRoutes)
app.use("/api/articulo" ,ArticuloRoutes)
app.use("/api/comentario" ,ComentarioRoutes)
app.use("/api/recovery", RecoveryRouter)
app.use("/api/proyecto", ProyectoRouter)
app.use("/api/categoria",CategoriaRoutes )
app.use("/api/redes", RedesRouter)
app.use("/api/stack", StackRouter)





//escuchar peticiones 
app.listen(puerto, ()=> {
    console.log("Server runing in port :" +puerto)
})