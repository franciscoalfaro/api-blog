const fs = require("fs")
const path = require("path")
const validarArticulo = require("../helpers/validateArticulo")
const Articulo = require("../models/articulo")
const Categoria = require("../models/categoria")
const mongoosePagination = require('mongoose-paginate-v2')
const User = require("../models/user")


//end-point para crear articulos
const crearArticulo = async (req, res) => {
    const params = req.body;  
  
    if (!params.titulo || !params.descripcion || !params.contenido || !params.categoria) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;
        //se comprueba desde helpers-validate
        validarArticulo.validar(params);

        let categoriaExistente = await Categoria.findOne({ userId, name: params.categoria });
        
        //se busca el usuario por el id, y se extre el nombre y apellido para mostrar en la respuesta
        let usuarioPublicacion = await User.findOne({_id:userId})

  
      if (!categoriaExistente) {
        categoriaExistente = await Categoria.create({ userId, name: params.categoria });
      }
 

        const newArticulo = await Articulo.create({
            userId: userId,
            titulo: params.titulo,
            descripcion: params.descripcion,
            contenido: params.contenido,
            categoria: categoriaExistente._id,
            Autor:usuarioPublicacion.name,
            ApellidoAutor:usuarioPublicacion.surname
          });



        await newArticulo.save();

        return res.status(200).json({
            status: "success",
            message: "publicacion guardada de forma correcta",
            newArticulo,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al crear el artículo",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para eliminar articulos
const eliminarArticulo = async (req, res) => {
    try {
        const articuloId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar el artículo y verificar si el usuario logueado es el creador
        const articuloEliminar = await Articulo.findOne({ _id: articuloId, userId: userId });

        if (!articuloEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'Articulo no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador del artículo
        if (articuloEliminar.userId.toString() !== userId) {
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


//end-point para modificar articulos
const actualizarArticulo = async (req, res) => {
    try {
        const userId = req.user.id;
        const idArticulo = req.params.id;  // Asumiendo que el id se encuentra en los parámetros
        const articuloActualizado = req.body;

        // Verificar si el artículo existe
        const articuloExistente = await Articulo.findById(idArticulo);

        if (!articuloExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Articulo no fue encontrado'
            });
        }

        // Verificar si el usuario logueado es el creador del artículo
        if (articuloExistente.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para modificar este artículo'
            });
        }

        // Actualizar el artículo con los datos proporcionados
        await Articulo.findByIdAndUpdate(idArticulo, articuloActualizado, { new: true });

        return res.status(200).json({
            status: 'success',
            message: 'Articulo actualizado correctamente',
            articuloExistente,
            articuloActualizado
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el artículo',
            error: error.message
        });
    }
};



//end-point para subir imagenes a los articulos
const upload = async (req, res) => {
    //sacar publication id
    const articuloId = req.params.id

    //recoger el fichero de image
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "image no seleccionada"
        })
    }

    //conseguir nombre del archivo
    let imagen = req.file.originalname

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
        const ImaUpdate = await Articulo.findOneAndUpdate({ "userId": req.user.id, "_id": articuloId }, { imagen: req.file.filename }, { new: true })


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
    const filePath = "./uploads/publications/" + file

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
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor"
        })
    }
}


//end-point para buscar articulos
const buscador = async (req, res) => {
    try {
        let busqueda = req.params.articulo;

        busqueda = busqueda.replace(/\+/g, ' ');

        let page = 1
        if (req.params.page) {
            page = req.params.page
        }
        page = parseInt(page)
    
        let itemPerPage = 5

        const options = {
            page,
            limit:itemPerPage,
            sort: { fecha: -1 },
            select: '-password', // Excluir campos sensibles si es necesario
        };

        // Utilizar expresiones regulares para realizar una búsqueda insensible a mayúsculas y minúsculas
        const resultados = await Articulo.paginate({
            $or: [
                { "titulo": { $regex: busqueda, $options: "i" } },
                { "descripcion": { $regex: busqueda, $options: "i" } },
                { "contenido": { $regex: busqueda, $options: "i" } },
            ]
        }, options);

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            resultados:resultados.docs,
            page:resultados.page,
            totalDocs:resultados.totalDocs,
            totalPages:resultados.totalPages,
            itemPerPage:resultados.limit


        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al realizar la búsqueda",
            error: error.message,
        });
    }
};


//end-point para listar todos los articulos
const listArticulos = async (req, res) => {
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
        populate:'categoria'
    }

    try {
        const articulos = await Articulo.paginate({}, opciones);

        if (!articulos) return res.status(404).json({ 
            status: "error", 
            message: "no se han encontrado articulos" 
        })

        await Articulo.populate(articulos.docs, { path: 'userId',select: '-password -email -role -__v -surname -create_at'});

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos:articulos.docs,
            
            page:articulos.page,
            totalDocs:articulos.totalDocs,
            totalPages: articulos.totalPages,
            itemPerPage:articulos.limit,
            categoria:articulos.categoria
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}

//end-point para mostrar 1 articulo - para mostrar o traer 1 articulo cuando se haga clic en leer desde el front
const buscarArticulo = async (req, res) => {
    try {
        const idArticulo = req.params.id;
        const articulo = await Articulo.findById(idArticulo).populate({
            path: 'userId',
            select: '-password -email -role -__v'
        });

        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "Articulo no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            articulo
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el artículo",
            error: error.message
        });
    }
};

//listar solo 3 articulos
const listUltimosArticulos = async (req, res) => {
    let itemPerPage = 3

    const opciones = {

        limit: itemPerPage,
        sort: { fecha: -1 }
    }

    try {
        const articulos = await Articulo.paginate({}, opciones);

        if (!articulos) return res.status(404).json({ 
            status: "error", 
            message: "no se han encontrado articulos" 
        })

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos:articulos.docs
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}


//end-point para listar los articulos del usuario logueado
const listMisArticulos = async (req, res) => {
    const userId = req.user.id;
    console.log(userId)
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 }
    }

    try {
        
        
        const articulos = await Articulo.paginate({userId:userId}, opciones);

        if (!articulos) return res.status(404).json({ 
            status: "error", 
            message: "no se han encontrado articulos" 
        })

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos:articulos.docs,
            
            page:articulos.page,
            totalDocs:articulos.totalDocs,
            totalPages: articulos.totalPages,
            itemPerPage:articulos.limit
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}

//end-point para buscar las publicaciones por un Id
const listArticulosPorId = async (req, res) => {
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
        sort: { fecha: -1 }
        
    }

    try {
       
        const articulos = await Articulo.paginate({userId:userId}, opciones);

        if (!articulos) return res.status(404).json({ 
            status: "error", 
            message: "no se han encontrado articulos" 
        })

        await Articulo.populate(articulos.docs, { path: 'userId categoria', select: '-email -password -__v -role'});

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos:articulos.docs,
            page:articulos.page,
            totalDocs:articulos.totalDocs,
            totalPages: articulos.totalPages,
            itemPerPage:articulos.limit
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}




module.exports = {
    crearArticulo,
    eliminarArticulo,
    actualizarArticulo,
    upload,
    media,
    buscador,
    listArticulos,
    buscarArticulo,
    listUltimosArticulos,
    listMisArticulos,
    listArticulosPorId
}