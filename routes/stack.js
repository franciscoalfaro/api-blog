const express = require("express")
const router = express.Router()
const multer = require("multer")
const StackController = require("../controller/stack")
const check = require("../middlewares/auth")

//definir rutas

router.post("/crear",check.auth, StackController.crearStack)
router.delete("/delete/:id",check.auth, StackController.eliminarStack)
router.put("/update/:id",check.auth, StackController.update)
router.get("/list/:page?",check.auth, StackController.list)





//exportar router
module.exports=router