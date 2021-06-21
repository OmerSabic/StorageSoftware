const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');
const fastify = require('fastify')({
    logger: false
});

const config = require('./vault.config')


const multer = require('fastify-multer');


// Storage variable, just some general stuff I shouldn't touch
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '---69---' + file.originalname) // The file name template, using "---69---" to separate the name in two parts. Where the first part is the upload date and the 2nd one is the file name and extension.
    }
})

const upload = multer({ storage: storage })

fastify.register(multer.contentParser)


fastify.register(require('fastify-static'), {
    root: path.join(__dirname + '/public')
})

fastify.register(require("point-of-view"), {
    engine: {
        ejs: require("ejs")
    }
});

// Main home page
fastify.get('/', (req, res) => {
    // read all files from /uploads folder and list them on the website
    fs.readdir('public/uploads', (err, files) => {
        if(err) {
            console.log(err)
        }
        else {
            return res.view('public/views/index.ejs', { files: files, name: config.name })
        }
    })
})

// Upload page
fastify.get('/uploadFile', (req, res) => {
    return res.view("public/views/upload.ejs")
})

// Get file by name
fastify.get('/file/:file', (req, res) => {
    return res.sendFile('/uploads/'+req.params.file)
})

// Delete file by name
fastify.get('/delete/:file', (req, res) => {
    fs.unlink('./public/uploads/'+req.params.file, function (err) {
        if (err) {
            return res.send(err)
        };
    });
    res.redirect('/')
})

// POST page for uploading
fastify.route({
    method: 'POST',
    url: '/upload',
    preHandler: upload.single('video'),
    handler: function (_request, reply) {
        reply.redirect('/')
    }
})


fastify.listen(PORT, "0.0.0.0", function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`server listening on ${address}`)
})