const express = require("express")
const router = express.Router()
const multer = require("multer")
const ComentarioController = require("../controller/comentario")
const check = require("../middlewares/auth")

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/publications")

    },

    filename:(req,file, cb) =>{
        cb(null,"articulo-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})

//definir rutas
router.post("/savecomment/:id",check.auth, ComentarioController.comment )
router.delete("/deletecomment/:id", check.auth, ComentarioController.removeComment)


//router.post("/upload/:id",[check.auth, uploads.single("file0")], ComentarioController.upload)
//router.get("/media/:file", ComentarioController.media)

router.get("/list",check.auth, ComentarioController.listCommen)




module.exports=router