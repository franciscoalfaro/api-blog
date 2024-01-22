const fs = require("fs")
const path = require("path")
const validarArticulo = require("../helpers/validateArticulo")

const mongoosePagination = require('mongoose-paginate-v2')

const Stack = require("../models/stack")

//end-point para crear articulos
const crearStack = async (req, res) => {
    const params = req.body;  
  
    if (!params.name || !params.description) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;

        let stackExistente = await Stack.findOne({ name: params.name, userId: userId  });

        if(stackExistente){
            return res.status(400).json({
                status: "error",
                message: "el stack ya existe intente con otro o actualice"
            });
    
        }
        
        
        const newStack = await Stack.create({
            userId: userId,
            description: params.description,
            name: params.name
          });



        await newStack.save();

        return res.status(200).json({
            status: "success",
            message: "stack guardado de forma correcta",
            newStack,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al crear el stack",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para eliminar stack
const eliminarStack = async (req, res) => {
    try {
        const stackId = req.params.id;
        const userId = req.user.id;
        console.log(userId)

        // Buscar stack y verificar si el usuario logueado es el creador
        const stackEliminar = await Stack.findOne({ _id: stackId, userId: userId });

        if (!stackEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'stack no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador de la stack
        if (stackEliminar.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar esta stack'
            });
        }

        await Stack.findByIdAndDelete(stackId);

        return res.status(200).json({
            status: 'success',
            message: 'stack eliminado correctamente',
            stackEliminar: stackEliminar
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
    const { id } = req.params; // ID de la stack a actualizar
    const { description, name } = req.body; // Nuevos datos de la stack 

    try {

        // Buscar stack por su ID

        const stackExistente = await Stack.findOne({ name });


        //verifica si existe un campo con el mismo nombre y un ID diferente al de la categoría que se está actualizando
        if (stackExistente && stackExistente._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'el nombre de stack ya esta siendo utilizado verifica el nombre'
            });
        }

        const stackActualizado = await Stack.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'stack actualizada correctamente',
            stackActualizado
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar stack',
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
        select: ("-password -email -role -__v")

    };

    try {
        // Filtrar el saldo por el ID del usuario
        const stack = await Stack.paginate({ userId: userId }, opciones);


        if (!stack || stack.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró stack para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de stack del usuario",
            stack:stack.docs,
            totalDocs:stack.totalDocs,
            totalPages:stack.totalPages,
            limit:stack.limit,
            page:stack.page,


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
    crearStack,
    eliminarStack,
    update,
    list
}