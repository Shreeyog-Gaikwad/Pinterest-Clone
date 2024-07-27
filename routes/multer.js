const multer = require("multer");
const {v4: uuidv4} = require('uuid');
const path = require("path"); // path module for extracting the extension of a particular file.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        const uniquename = uuidv4();
      cb(null, uniquename+path.extname(file.originalname)); // extension extraction 
    }
  })
  
  const upload = multer({ storage: storage });

  module.exports = upload;