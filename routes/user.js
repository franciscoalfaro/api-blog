const express = require("express")
const router = express.Router()
const multer = require("multer")
const UserController = require("../controller/user")
const ContactoController = require("../controller/contacto")
const check = require("../middlewares/auth")

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/avatars")

    },

    filename:(req,file, cb) =>{
        cb(null,"avatar-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})

//definir rutas

router.post("/register", UserController.register)
router.post("/login",UserController.login)
router.get("/profile/:id",check.auth, UserController.profile)
router.get("/list/:page?",check.auth, UserController.list)
router.put("/update",check.auth, UserController.update)
router.post("/upload",[check.auth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", UserController.avatar)
router.delete("/delete/:id", check.auth, UserController.remove)

//rutas publicas
router.get("/lastprofiles/:page?", UserController.publicListUser)
router.get("/profileselect/:id", UserController.publicProfile)

router.post("/contacto",ContactoController.contacto)




//exportar router
module.exports=router