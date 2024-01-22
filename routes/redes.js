const express = require("express")
const router = express.Router()
const multer = require("multer")
const RedesController = require("../controller/redes")
const check = require("../middlewares/auth")

//definir rutas

router.post("/crear",check.auth, RedesController.crearRed)
router.delete("/delete/:id",check.auth, RedesController.eliminarRed)
router.put("/update/:id",check.auth, RedesController.update)
router.get("/list/:page?",check.auth, RedesController.list)





//exportar router
module.exports=router