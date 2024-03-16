const fs = require("fs")
const path = require("path")
const validarArticulo = require("../helpers/validateArticulo")

const mongoosePagination = require('mongoose-paginate-v2')

const Redes = require("../models/redes")
const Users = require("../models/user")

//end-point para crear articulos
const crearRed = async (req, res) => {
    const params = req.body;  
  
    if (!params.name || !params.valor) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;

        let contactoExistente = await Redes.findOne({ name: params.name, userId: userId  });
        console.log(contactoExistente)

        if(contactoExistente){
            return res.status(400).json({
                status: "error",
                message: "el contacto ya existe intente con otro"
            });
    
        }
        
        
        const newRed = await Redes.create({
            userId: userId,
            valor: params.valor,
            name: params.name
          });



        await newRed.save();

        return res.status(200).json({
            status: "success",
            message: "Red guardada de forma correcta",
            newRed,
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

//end-point para eliminar red
const eliminarRed = async (req, res) => {
    try {
        const redId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar la red y verificar si el usuario logueado es el creador
        const redEliminar = await Redes.findOne({ _id: redId, userId: userId });

        if (!redEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'Red no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador de la red
        if (redEliminar.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar esta red'
            });
        }

        await Redes.findByIdAndDelete(redId);

        return res.status(200).json({
            status: 'success',
            message: 'Red eliminado correctamente',
            redEliminada: redEliminar
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el artículo',
            error: error.message
        });
    }
}

const update = async (req, res) => {
    const { id } = req.params; // ID de la red a actualizar
    const { valor, name } = req.body; // Nuevos datos de la red 

    try {

        // Buscar la red por su ID

        const redesExistente = await Redes.findOne({ name });


        //verifica si existe un campo con el mismo nombre y un ID diferente al de la categoría que se está actualizando
        if (redesExistente && redesExistente._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'el nombre la red ya esta siendo utilizado verifica el nombre'
            });
        }

        const redActualizada = await Redes.findByIdAndUpdate(
            id,
            { name, valor },
            { new: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Red actualizada correctamente',
            redActualizada
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la red',
            error: error.message
        });
    }

}


//este end-poit es para listar las redes del usuario logueado
const list = async (req, res) => {
    const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token
    
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")
    };

    try {
        // Filtrar el saldo por el ID del usuario
        const redes = await Redes.paginate({ userId: userId }, opciones);


        if (!redes || redes.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró redes para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de redes del usuario",
            redes:redes.docs,
            totalDocs:redes.totalDocs,
            totalPages:redes.totalPages,
            limit:redes.limit,
            page:redes.page,


        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las redes',
            error: error.message
        });
    }
};

//end-point para listar las redes de un usuario por ID
const listUserId = async(req, res)=>{

    let userParams = req.params.id;
    console.log(userParams)

    if (!userParams) {
        try {
            const usuario = await Users.findOne({ email: "franciscoalfar@gmail.com" });
            if (!usuario) {
                return res.status(404).json({
                    status: "Error",
                    message: "No se encontró el usuario en la base de datos"
                });
            }
            userParams = usuario._id;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al buscar el usuario en la base de datos',
                error: error.message
            });
        }
    }


    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")

    };

    try {
        // Filtrar el saldo por el ID del usuario
        const redes = await Redes.paginate({ userId: userParams }, opciones);
       
        if (!redes || redes.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró redes para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de redes del usuario",
            redes:redes.docs,
            totalDocs:redes.totalDocs,
            totalPages:redes.totalPages,
            limit:redes.limit,
            page:redes.page,


        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las redes',
            error: error.message
        });
    }

}


module.exports={
    crearRed,
    eliminarRed,
    update,
    list,
    listUserId
}
