const express = require("express")
const router = express.Router()
const multer = require("multer")
const check = require("../middlewares/auth")

const ProyectoController = require("../controller/proyecto")


//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/project")

    },

    filename:(req,file, cb) =>{
        cb(null,"project-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})

//exportar router
router.post("/crearproyecto",check.auth, ProyectoController.crearProyecto)
router.get("/list/:page?",check.auth, ProyectoController.listarProyecto)

router.put("/update/:id",check.auth, ProyectoController.actualizarProyecto)
router.delete("/delete/:id",check.auth, ProyectoController.eliminarProyecto)

//media
router.post("/upload/:id",[check.auth, uploads.single("file0")], ProyectoController.upload)
router.get("/media/:file", ProyectoController.media)





module.exports=router