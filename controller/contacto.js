const fs = require("fs")
const path = require("path")

const mongoosePagination = require('mongoose-paginate-v2')
const Contacto = require("../models/contacto")
const Redes = require("../models/redes")

//crear el nombre del contacto
const crearContacto = async (req, res) => {
    let params = req.body;
    console.log(params)

    if (!params.name) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Obtener el userId del usuario autenticado desde el token
        const userId = req.user.id;
        console.log(userId)

        // Comprobar si la categoría ya existe por su nombre para el usuario actual
        const contactoExistente = await Contacto.findOne({ name: params.name, userId: userId });

        if (contactoExistente) {
            return res.status(409).json({
                status: "error",
                message: "el contacto ya existe para este usuario"
            });
        }

        // Si el contacto no existe para el usuario actual, crearla asociada a ese usuario
        const nuevoContacto = await Contacto.create({
            name: params.name,
            userId: userId // Asociar el contacto al usuario actual
        });

        return res.status(201).json({
            status: "success",
            message: "contacto creada correctamente",
            contacto: nuevoContacto
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al crear la categoría",
            error: error.message
        });
    }
}

//eliminar el contacto o nombre de la red
const eliminarContacto = async (req, res) => {
    try {
        const contactoId = req.params.id;
        const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token

        // Buscar la categoría por su ID y el usuario que la creó
        const contactoEliminar = await Contacto.findOne({ _id: contactoId, userId: userId });

        if (!contactoEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada o no tiene permisos para eliminarla'
            });
        }

        // Encontrar la categoría predeterminada (por ejemplo, "otros") asociada al usuario
        let contactoPredeterminado = await Contacto.findOne({ name: 'otros', userId: userId });

        // Si no se encuentra la categoría predeterminada, crearla asociada al usuario
        if (!contactoPredeterminado) {
            contactoPredeterminado = await Contacto.create({ name: 'otros', userId: userId });
        }

        // Actualizar los gastos asociados a la categoría que se eliminará
        await Redes.updateMany({ contacto: contactoId, userId: userId }, { contacto: contactoPredeterminado._id });

        // Eliminar la categoría asociada al usuario
        await Contacto.findByIdAndDelete(contactoId);

        return res.status(200).json({
            status: 'success',
            message: 'Categoría eliminada correctamente'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la categoría',
            error: error.message
        });
    }
};

//actualizar el nombre del contacto o la red

const actualizarContacto = async (req, res) => {
    const { id } = req.params; // ID de la categoría
    const { name } = req.body; // Nuevos datos de la categoría

    try {
        // Buscar la categoría por su nombre
        const contactoExistente = await Contacto.findOne({ name });


        // Si existe una categoría con el mismo nombre y un ID diferente al de la categoría que se está actualizando
        if (contactoExistente && contactoExistente._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'El nombre del contacto ya existe'
            });
        }

        // Actualizar la categoría por su ID
        const contactoActualizado = await Contacto.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!contactoActualizado) {
            return res.status(404).json({
                status: 'error',
                message: 'el contacto no fue encontrada'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'contacto actualizado correctamente',
            categoria: contactoActualizado
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el contacto',
            error: error.message
        });
    }
};

//listar mis nombre de contactos-redes
const listarContadoDrop = async (req, res) => {
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token

    try {

        // Buscar todas las categorías asociadas al usuario
        const contactos = await Contacto.paginate({ userId} );

        return res.status(200).json({
            status: 'success',
            message: 'Categorías encontradas',
            contactos:contactos.docs
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};



module.exports={
    crearContacto,
    eliminarContacto,
    actualizarContacto,
    listarContadoDrop

}

