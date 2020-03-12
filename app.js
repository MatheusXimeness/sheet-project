const express = require("express")
const server = express()
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const path = require("path")

const multer = require('multer')
const upload = multer({
    dest: 'uploads/'
})

const XLSX = require('xlsx')
const glob = require('glob')
const fs = require('fs')

// Planilha 
const parseExcel = function (file) {

    var data = file
    var workbook = XLSX.readFile(data, {
        type: 'binary'
    });

    var sheet = workbook.SheetNames[0]
    var myData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
        header: 1,
        defval: '',
        blankrows: true
    })

    console.log(myData)
    return JSON.stringify(myData)
}


// Config 

server.engine("handlebars", handlebars({ defaultLayout: "main" }))
server.set("view engine", "handlebars")

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

server.use(express.static(path.join(__dirname, "public")))
server.use((req, res, next) => {
    console.log("Checar login")
    next()
})

server.get("/", (req, res) => {
    res.render('test')
})

server.post('/', upload.single('file-to-upload'), (req, res) => {
    res.redirect('/show');
})

server.get("/show", (req, res) => {
    const newestFile = glob.sync('uploads/*')
        .map(name => ({ name, ctime: fs.statSync(name).ctime }))
        .sort((a, b) => b.ctime - a.ctime)[0].name

    res.render("show", { data: parseExcel(newestFile) })
})

server.use("/logged", require("./routes/logged.js"))

mongoose.connect('mongodb://127.0.0.1:27017/pla', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => { console.log("Conectado") }).catch((err) => { console.log(err) })

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    can_read_sheet: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    can_write_sheet: {
        type: [mongoose.Schema.Types.ObjectId]
    }
})
const User = mongoose.model("User", UserSchema)
/*
new User({
    name: "Eduardo",
    password: "b"
}).save().then(() => { 
        User.find().then((users) => {
        users.forEach((user) => {
            //user.can_read_sheet.push(new mongoose.Types.ObjectId("5e667f2364c701242c13ee26"))
    
            //user.save()
            console.log(user+"\n")
        })
    })    
}).catch((err) => {console.log(err)})*/
/*
User.find().then((users) => {
    users.forEach((user) => {
        //user.can_read_sheet.push(new mongoose.Types.ObjectId("5e667f2364c701242c13ee26"))

        //user.save()
        console.log(user+"\n")
    })
})    */



server.listen(3000, () => { console.log("Server running") })