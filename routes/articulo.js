const express = require("express")
const router = express.Router()
const multer = require("multer")
const ArticuloController = require("../controller/articulo")
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

//crear, eliminar, update
router.post("/create",check.auth, ArticuloController.crearArticulo)
router.delete("/delete/:id",check.auth, ArticuloController.eliminarArticulo)
router.put("/update/:id",check.auth, ArticuloController.actualizarArticulo)

//imagenes
router.post("/upload/:id",[check.auth, uploads.single("file0")], ArticuloController.upload)
router.get("/media/:file", ArticuloController.media)
//buscar articulos
router.get("/search/:articulo/:page?", ArticuloController.buscador);

//consultar y traer el articulo por el id
router.get("/obtenido/:id", ArticuloController.buscarArticulo)

//listar los articulos
router.get("/list/:page?", ArticuloController.listArticulos)
router.get("/ultimos/", ArticuloController.listUltimosArticulos)
router.get("/misarticulos/:page?",check.auth, ArticuloController.listMisArticulos)

router.get("/articulouser/:id/:page?", ArticuloController.listArticulosPorId)




module.exports=router