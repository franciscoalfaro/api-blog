const express = require("express")
const router = express.Router()
const CategoriaController = require("../controller/categoria")
const check = require("../middlewares/auth")

//ruta para crear actualizar y elmiminar gastos
router.post("/crearcategoria",check.auth, CategoriaController.crearCategoria)
router.put("/update/:id",check.auth, CategoriaController.actualizarCategoria)
router.delete("/delete/:id",check.auth, CategoriaController.eliminarCategoria)
router.get("/list/:page?",check.auth, CategoriaController.listarCategorias)
router.get("/listcategoria/",check.auth, CategoriaController.listarCategoriasDrop)

module.exports=router