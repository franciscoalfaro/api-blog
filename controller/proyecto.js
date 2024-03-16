const Proyecto = require("../models/proyecto")
const fs = require("fs")
const path = require("path")


//end-point para crear proyectos
const crearProyecto = async (req, res) => {
    const params = req.body;

    if (!params.titulo || !params.contenido  || !params.descripcion || !params.categoria) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;

        const newProyecto = new Proyecto(params);
        newProyecto.user = userId;

        await newProyecto.save();

        return res.status(200).json({
            status: "success",
            message: "Proyecto guardado de forma correcta",
            newProyecto,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al crear el Proyecto",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para eliminar proyectos
const eliminarProyecto = async (req, res) => {
    try {
        const articuloId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar el artículo y verificar si el usuario logueado es el creador
        const articuloEliminar = await Articulo.findOne({ _id: articuloId, user: userId });

        if (!articuloEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'Articulo no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador del artículo
        if (articuloEliminar.user.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar este artículo'
            });
        }

        await Articulo.findByIdAndDelete(articuloId);

        return res.status(200).json({
            status: 'success',
            message: 'Articulo eliminado correctamente',
            articuloEliminado: articuloEliminar
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el artículo',
            error: error.message
        });
    }
}


//end-point para modificar proyectos
const actualizarProyecto = async (req, res) => {
    try {
        const userId = req.user.id;
        const idProyecto = req.params.id;  // Asumiendo que el id se encuentra en los parámetros
        const proyectoActualizado = req.body;

        // Verificar si el proyecto existe
        const proyectoExistente = await Proyecto.findById(idProyecto);

        if (!proyectoExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Proyecto no fue encontrado'
            });
        }

        // Verificar si el usuario logueado es el creador del proyecto
        if (proyectoExistente.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para modificar este Proyecto'
            });
        }

        // Actualizar el proyecto con los datos proporcionados
        await Proyecto.findByIdAndUpdate(idProyecto, proyectoActualizado, { new: true });

        return res.status(200).json({
            status: 'success',
            message: 'Proyecto actualizado correctamente',
            proyectoExistente,
            proyectoActualizado
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el Proyecto',
            error: error.message
        });
    }
};

//listar proyectos del usuario
const listarProyecto = async (req, res) => {
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token
    console.log(userId)
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    try {
        const options = {
            page: page,
            limit: itemPerPage
            
        };
        // Buscar todas los proyectos asociadas al usuario
        const proyectos = await Proyecto.paginate({ userId },options );

        return res.status(200).json({
            status: 'success',
            message: 'Proyectos encontrados',
            proyectos:proyectos.docs,
            totalPages: proyectos.totalPages,
            totalCategories: proyectos.totalCategoria,
            itempage: proyectos.limit,
            page: proyectos.page,
            totalDocs:proyectos.totalDocs

        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};


//end-point para subir imagenes a los articulos
const upload = async (req, res) => {
    //sacar proyecto id
    const proyectoId = req.params.id
    console.log(proyectoId)

    //recoger el fichero de image
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "image no seleccionada"
        })
    }

    //conseguir nombre del archivo
    let imagen = req.file.originalname
    console.log(imagen)

    //obtener extension del archivo
    const imageSplit = imagen.split("\.");
    const extension = imageSplit[1].toLowerCase();

    //comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //borrar archivo y devolver respuesta en caso de que archivo no sea de extension valida.
        const filePath = req.file.path
        const fileDelete = fs.unlinkSync(filePath)

        //devolver respuesta.        
        return res.status(400).json({
            status: "error",
            mensaje: "Extension no invalida"
        })

    }

    try {
        const ImaUpdate = await Proyecto.findOneAndUpdate({ "userId": req.user.id, "_id": proyectoId }, { imagen: req.file.filename }, { new: true })
        console.log(ImaUpdate)


        if (!ImaUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" })
        }
        //entrega respuesta corrrecta de image subida
        return res.status(200).json({
            status: "success",
            message: "publicacion actualizada",
            file: req.file,
            ImaUpdate
        });
    } catch (error) {
        if (error) {
            const filePath = req.file.path
            const fileDelete = fs.unlinkSync(filePath)
            return res.status(500).send({
                status: "error",
                message: "error al obtener la informacion en servidor",
            })
        }

    }

}


//devolver archivos multimedia
const media = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file


    //montar el path real de la image
    const filePath = "./uploads/proyecto/" + file
    console.log(filePath)
 
    try {
        //comprobar si archivo existe
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({
                    status: "error",
                    message: "la image no existe"
                })
              
            }
            //devolver archivo en el caso de existir  
            return res.sendFile(path.resolve(filePath));
            
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor"
        })
    }
}


const listStackPorId = async (req, res) => {
    const userId = req.params.id;
    
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 },
        select: ("-password -email -role -__v")       
    }

    try {
       
        const proyect = await Proyecto.paginate({userId:userId}, opciones);

        if (!proyect || proyect.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró proyectos para este usuario"
            });
        }



        return res.status(200).send({
            status: "success",
            message: "proyectos encontrados",
            proyectos:proyect.docs,
            page:proyect.page,
            totalDocs:proyect.totalDocs,
            totalPages: proyect.totalPages,
            itemPerPage:proyect.limit
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'error al listar proyecto',
            error: error.message,
        });

    }
}



module.exports = {
    crearProyecto,
    eliminarProyecto,
    actualizarProyecto,
    listarProyecto,
    upload,
    media,
    listStackPorId


}