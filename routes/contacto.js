const express = require("express")
const router = express.Router()
const multer = require("multer")
const ContactoController = require("../controller/contacto")
const check = require("../middlewares/auth")

//definir rutas

router.post("/create",check.auth, ContactoController.crearContacto)
router.put("/update/:id",check.auth, ContactoController.actualizarContacto)
router.delete("/delete/:id",check.auth, ContactoController.eliminarContacto)
router.get("/list/",check.auth, ContactoController.listarContadoDrop)



//rutas publicas
//router.get("/lastprofiles/:page?", UserController.publicListUser)
//router.get("/profileselect/:id", UserController.publicProfile)




//exportar router
module.exports=router