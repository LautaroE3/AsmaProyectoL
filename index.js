const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const PassportLocal = require('passport-local').Strategy;


//Base de Datos
const mongoose = require("mongoose");
const Admin = require("./models/myModel");
const PostModel = require("./models/postModel");

//hash
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");
//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;
global.idPosts= 1;


//vistas
app.set("view engine", "ejs");
//Defino la localización de mis vistas
app.set("views", path.join(__dirname, "views"));

app.use(cors());
//Middlewares
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
//Middleware para poder obtener data de los requests con BodyParser
app.use(express.json());
//Configurando archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('clave'));
app.use(
    session({
        secret: 'clave',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new PassportLocal(function(username,password,done){
    
    if(username=="Doctor" && password =="adm"){
    login=true;
    return done(null,{id:1,name:"Admin"});
    }
    done(null,false);

}));
passport.serializeUser(function(username,done){
    done(null,username.id);
});
passport.deserializeUser(function(id,done){
    done(null,{id:1,name:"Admin"});
});



const port = 3000;
//Corremos el servidor en el puerto seleccionado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port} correctamente`);
});
//Conexión al cloud de Mongodb Atlas ...
mongoose
    .connect(
        "mongodb+srv://hrgarcia:EaFhXeNfxbG277Zz@cluster0.fs8tm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
        }
    )
    .then((con) => {
        console.log("Conectado a la DB");
    });
//controlador principal
app.get("/", (req, res) => {
    res.status(200).render("index", { login: login, isLogin: isLogin });
});

//Controlador de Admin
app.get("/login", (req, res) => {
    res.status(200).render("login", { isLogin: isLogin, login: login });
});
app.post("/login",passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/login",
}));

app.get('/seccionAdmin',(req,res,next)=>{
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
},
 (req, res) => {
        res.status(200).render("edicionPosteos", {data:PostModel.find()});
});

app.get("/logout",(req,res,next)=>{
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
}, (req, res) => {
        login = false;
        req.session.destroy();   
        res.redirect("/");
});
app.get("/error404", (req, res) => {
    res.status(200).render("error404");

});
app.get('/visualizar', (req, res) => {
    res.status(200).render("visualizarPost");
    
});

app.get("/kinesiologia", (req, res) => {
    res.status(200).render("kinesiologia");
    
});
app.get("/saludMental", (req, res) => {
    res.status(200).render("saludmental");
    
});
app.get("/neumonologia", (req, res) => {
    res.status(200).render("neumonologia");
});
app.get("/postear",(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    
    isLogin = 4
    res.redirect("/login");
}, (req, res) => {
        res.status(200).render("postPrueba", { isLogin: isLogin, login: login });
});
app.post("/subirpost", (req, res) => {
        let fecha=req.body.fecha;
        let titulo= req.body.titulo;
        let descripcion = req.body.descripcion;
        let imagen = req.body.imagen;
        let enlace = req.body.enlace;
        let tag = req.body.tag;

        let post = new PostModel({
        id:idPosts,
        fecha: fecha,
        titulo: titulo,
        descripcion: descripcion,
        imagen: imagen,
        enlace: enlace,
        tags: tag,
        });  
        post.save((err,db)=>{
            if(err) console.error(err);
            console.log("se guardo un posteo");
            PostModel.findOne().sort({id: -1}).exec(function(err, post) {   
            console.log("Ultimo Id:"+post.id.toString());
                idPosts=post.id+1;
            });
            })
            res.status(200).render("edicionPosteos", {data:PostModel.find()});
            
});

app.get("/config",(req,res,next)=>{
    if(req.isAuthenticated()) return next();

    isLogin=4;
    res.redirect("/login");
}, (req, res) => {
        res.status(200).render("config");
});

app.post("/ChangeDatos",(req,res,next)=>{
    if(req.isAuthenticated()) return next();

    res.redirect("/login");
}, (req, res) => {
        Admin.findOneAndUpdate({ nombre: "admin" },
{ $set: { contraseña: req.body.contraseña } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: login });
            });


            Admin.findOneAndUpdate({ nombre: "admin" },
            { $set: { usuario: req.body.usuario } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: login });
            });


});

app.get("/subirPost", (req, res) => {
    res.status(200).render("postear2");
});






app.get("/*", (req, res) => {
    res.status(200).render("error404");
    
});


app.get("/subirPost", (req, res) => {
    res.status(200).render("postear2");
});



//RUTAS
/*
  
    router.route("/edicion").get(adminController.edicion);
    router.route("/editarPosteo").get(adminController.editarPost);
  
*/




app.post("/cargarImagen", async (req, res) => {
    res.render("config");
});
app.post("/guardarImagen", async (req, res) => {
    res.render("config");
});

module.exports = app;
