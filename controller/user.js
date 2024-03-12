const fs = require("fs")
const bcrypt = require("bcrypt")
const mongoosePagination = require('mongoose-paginate-v2')
const path = require("path")

// importar modelo
const User = require("../models/user")

//importar servicio
const validate = require("../helpers/validate")
const jwt = require("../services/jwt")
// end-point

//registro usuarios
const register = (req, res) => {
    //recoger datos de la peticion
    let params = req.body;
    console.log(params)
    //comprobar datos + validacion
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "faltan datos por enviar"
        })
    }

    try {
        validate.validate(params)

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion no superada",
        })


    }

    //consultar si usuario existe en la BD para ser guardado, en el caso de existir indicara que el nick y correo ya existen 
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ],
    }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "warning",
                message: "El usuario ya existe",
            });
        }

        //Cifrar la contraseña con bcrypt
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;


        //Crear objeto  de usuario para guardar en la BD
        let user_to_save = new User(params);

        //Guardar usuario en la bdd
        user_to_save.save().then((userStored) => {
            //Devolver el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored,
            });
        }).catch((error) => {
            if (error || !userStored) return res.status(500).send({ status: "error", message: "error al guardar el usuario" })
        })

    })
}

//Login de usuario
const login = (req, res) => {

    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error_404",
            message: "faltan datos por enviar"
        })
    }
    //buscar a ususario en la BD  .select({"password":0}) oculta la pass del resultado
    User.findOne({ email: params.email })
        .then((user) => {
            if (!user) return res.status(404).json({ status: "Not Found", message: "Usuario no registrado" })

            //comprobar password que llega por el body y con la password del usuario de la BD
            const pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(400).send({
                    error: "Error_pass",
                    message: "No te has identificado de forma correcta. "

                })
            }

            //si usuario con cuenta desactivada se loguea nuevamente se cambia estado de cuenta desactivada=true a cuenta desactivada=false
            user.eliminado = false;
            // guardar el usuario actualizado en la BD
            user.save();


            //devolver token
            const token = jwt.createToken(user)

            //devolver datos del usuario
            return res.status(200).json({
                status: "success",
                message: "Te has identificado de forma correcta.",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick,
                },
                token,

            });


        }).catch((error) => {
            if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
            console.log(error)

        });


}

// perfil
const profile = async (req, res) => {
    try {
        // Recibir parámetro id por URL
        const id = req.params.id;

        // Buscar el usuario por ID y excluir campos sensibles
        const userProfile = await User.findById(id).select({ "password": 0, "role": 0 });

        if (!userProfile) {
            return res.status(404).json({ status: "error", message: "NO SE HA ENCONTRADO EL USUARIO" });
        }

        // Enviar la respuesta con el perfil del usuario
        return res.status(200).json({
            status: "success",
            message: "profile found successfully",
            user: userProfile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "error al obtener el usuario en el servidor" });
    }
};


//listar usuarios
const list = (req, res) => {
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 12

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { create_at: -1 },
        select: ("-password -email -role -__v")
    }

    try {
        User.paginate({}, opciones, async (error, users) => {

            if (error || !users) return res.status(404).json({ status: "error", message: "NO SE HA ENCONTRADO EL USUARIO" })

            return res.status(200).send({
                status: "success",
                message: "listado de usuarios",
                users: users.docs,
                pages: users.totalPages,
                totalDocs: users.totalDocs,
                itempage: users.limit,
                page: users.page,

            })

        })

    } catch (error) {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
        console.log(error);

    }
}

//actualizar datos del usuario
const update = (req, res) => {
    //recoger datos del usuario que se actualizara
    const userIdentity = req.user


    let userToUpdate = req.body

    //eliminar campos sobrantes. 
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;


    //comprobar si usuario ya existe

    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
        ],
    }).then(async (users) => {
        if (!users) return res.status(500).send({ status: "error", message: "no existe el usuario a actualizar" })

        let userIsset = false
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true
        })

        if (userIsset) {
            return res.status(200).send({
                status: "warning",
                message: "El usuario/nick ya existe"
            });

        }

        //si pass cifrarla. 
        if (userToUpdate.password) {
            //Cifrar la contraseña con bcrypt
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password
        }

        //se busca el usuario y se actualiza, en el caso de que exista error en el usuario a actualizar lanzara error  caso contrario actualizara

        try {
            let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })

            if (!userUpdate) {
                return res.status(400).json({ status: "error", message: "error al actualizar" })
            }

            return res.status(200).json({
                status: "success",
                message: "profile update success",
                user: userToUpdate


            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "error al obtener la informacion en servidor"
            })
        }

    })

}

const avatar = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file
    
    //montar el path real de la image
    const filePath = "./uploads/avatars/" + file

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

//subida de image
const upload = async (req, res) => {
    
    //recoger el fichero de image
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "imagen no seleccionada"
        })
    }

    //conseguir nombre del archivo
    let image = req.file.originalname
    console.log(image)

    //obtener extension del archivo
    const imageSplit = image.split("\.");
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
        const ImaUpdate = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        if (!ImaUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" })
        }
        //entrega respuesta corrrecta de image subida
        return res.status(200).json({
            status: "success",
            message: "avatar actualizado",
            user: req.user,
            file: req.file,
            image
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

//eliminar usuario/cuenta
const remove = async (req, res) => {
    try {
        // Obtener el ID del usuario
        const userId = req.params.id;

        // Eliminacion del usuario de forma logica - se modifica el modelo para agregar el campo eliminado por defecto en false
        const userDelete = await User.findByIdAndUpdate(userId, { eliminado: true });


        if (userDelete) {
            return res.status(200).json({
                status: "success",
                message: "Usuario eliminado",
                user: userDelete
            });
        } else {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar usuario",
            error: error.message
        });
    }
}




const publicListUser = async (req, res) => {
    let itemPerPage = 3

    const opciones = {

        limit: itemPerPage,
        sort: { fecha: -1 },
        select: '-password -email -role -__v -nick'
    }

    try {
        const usuarios = await User.paginate({}, opciones);

        if (!usuarios) return res.status(404).json({ 
            status: "error", 
            message: "no se han encontrado usuarios" 
        })

        return res.status(200).send({
            status: "success",
            message: "usuarios encontrados",
            usuarios: usuarios.docs,
            totalPages: usuarios.totalPages,
            totalDocs: usuarios.totalDocs,
            itempage: usuarios.limit,
            page: usuarios.page,

        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}


const publicProfile = async (req, res) => {
    try {
        // Recibir parámetro id por URL
        const id = req.params.id;

        // Buscar el usuario por ID y excluir campos sensibles
        const userProfile = await User.findById(id).select({ "password": 0, "role": 0, "nick":0});

        if (!userProfile) {
            return res.status(404).json({ status: "error", message: "NO SE HA ENCONTRADO EL USUARIO" });
        }

        // Enviar la respuesta con el perfil del usuario
        return res.status(200).json({
            status: "success",
            message: "profile found successfully",
            user: userProfile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "error al obtener el usuario en el servidor" });
    }
};




module.exports = {
    register,
    login,
    profile,
    list,
    update,
    avatar,
    upload,
    remove,
    publicListUser,
    publicProfile
}