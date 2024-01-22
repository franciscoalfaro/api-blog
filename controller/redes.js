const fs = require("fs")
const path = require("path")
const validarArticulo = require("../helpers/validateArticulo")

const mongoosePagination = require('mongoose-paginate-v2')
const Contacto = require("../models/contacto")
const Redes = require("../models/redes")

//end-point para crear articulos
const crearRed = async (req, res) => {
    const params = req.body;  
  
    if (!params.valor || !params.contacto) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;


        let contactoExistente = await Contacto.findOne({ userId, name: params.contacto });

        if(!contactoExistente){
            console.log('contacto no existe')
        }
        
        
        const newRed = await Redes.create({
            userId: userId,
            valor: params.valor,
            contacto: params.contacto
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
    const { valor, contacto } = req.body; // Nuevos datos de la red
    console.log(contacto)
  

    try {
        // Buscar la categoría por su nombre
        const contactoExistente = await Contacto.findOne({ _id: contacto });       

        if (!contactoExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'el contacto no fue encontrado'
            });
        }

        // Buscar la red por su ID
        const redesExistente = await Redes.findById(id);

        if (!redesExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'la red no fue encontrada'
            });
        }

        // Actualizar los campos del gasto
        redesExistente.valor = valor || redesExistente.valor;
        redesExistente.contacto = contactoExistente._id; // Asignar el ID de la categoría encontrada

        // Guardar los cambios en la base de datos
        await redesExistente.save();

        return res.status(200).json({
            status: 'success',
            message: 'Red actualizada correctamente',
            gasto: redesExistente
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la red',
            error: error.message
        });
    }

}


//este end-poit es para listar el historico del saldo del usuario 
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
        select: ("-password -email -role -__v"),
        populate:'contacto'

    };

    try {
        // Filtrar el saldo por el ID del usuario
        const redes = await Redes.paginate({ userId: userId }, opciones);


        if (!redes || redes.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró saldo para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de saldos del usuario",
            redes:redes.docs,
            contacto:redes.contacto

        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el saldo',
            error: error.message
        });
    }
};






module.exports={
    crearRed,
    eliminarRed,
    update,
    list


}
