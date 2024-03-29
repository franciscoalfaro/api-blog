//importar modulos
const fs = require("fs")
const path = require("path")
const mongoosePagination = require('mongoose-paginate-v2')

const Articulo = require("../models/articulo")
const Comentario = require("../models/comentario")


const comment = async (req, res) => {
    try {
        const params = req.body;
        const articuloId = req.params.id
        console.log(articuloId)


        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto del comentario"
            });
        }

        //se crea el nuevo objeto para ser guardado en la BD el cual tiene el id de la publicacion el usuario que comento y el comentario

        const newComment = new Comentario({
            comentario: params.text,
            articulo: articuloId,
            user: req.user.id
        });
        console.log(newComment)

        //guardar comentario 
        const commentStored = await newComment.save();

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "Comentario guardado de forma correcta",
            commentStored
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al guardar el comentario" });
    }
}

//eliminar comentario comentDelete comentario: comentDelete
const removeComment = async (req, res) => {
    try {
        //obtener id de la publicacion
        const commentsId = req.params.id;
        const userId = req.user.id;
        

        //buscar la publicacion comparando el id del usuario con el id de la publicacion y borrarlo
        //otra forma de buscar y elminar comentario
        //const comentario = await Comentario.findByIdAndDelete({ _id: commentsId, user: userId });

        const comentario = await Comentario.findByIdAndDelete({ "_id": commentsId })
    
        //si no existe el comentario se responde un 404
        if (!comentario) {
            return res.status(404).json({
                status: "error",
                message: "el comentario no existe para eliminar",
            });

        }
        //si comentario existe se elimina. 
        return res.status(200).json({
            status: "success",
            message: "el comentario ha sido eliminado",
            comentario
        });


    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al eliminar comentario  o no existe" })
    }


}

//listar comentarios
const listCommen = (req, res) => {
    const publicationId = req.params.id;
  
    let page = 1;
    if (req.params.page) {
      page = req.params.page;
    }
    const itemsPerPage = 3;
  
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { create_at: -1 },
      populate: { path: 'user', select: '-password -role -__v -email -create_at' }
    };
    
    Comentario.paginate({ 'publication': publicationId }, options).then((comments) => {
        if (!comments.docs || comments.docs <= 0) {
            return res.status(404).send({ status: "error", message: "no existen comentarios" })
        }
        
        return res.status(200).json({
          status: "success",
          message: "Listado de comentarios",
          comments:comments.docs,
          totalDocs:comments.totalDocs,
          totalPages: comments.totalPages,
          page:comments.page
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al obtener información del servidor" });
      });

}


module.exports = {
    comment,
    removeComment,
    listCommen

}