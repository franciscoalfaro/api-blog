const express = require("express")
const router = express.Router()
const multer = require("multer")
const check = require("../middlewares/auth")

const ProyectoController = require("../controller/proyecto")



//exportar router
router.post("/crearproyecto",check.auth, ProyectoController.crearProyecto)
router.get("/list/:page?",check.auth, ProyectoController.listarProyecto)

router.put("/update/:id",check.auth, ProyectoController.actualizarProyecto)
router.delete("/delete/:id",check.auth, ProyectoController.eliminarProyecto)



module.exports=router