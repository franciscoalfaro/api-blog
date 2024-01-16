const Proyecto = require("../models/proyecto")


//end-point para crear articulos
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

//end-point para eliminar articulos
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


//end-point para modificar articulos
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

module.exports = {
    crearProyecto,
    eliminarProyecto,
    actualizarProyecto,
    listarProyecto

}