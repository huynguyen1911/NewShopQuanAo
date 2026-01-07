const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/public/images');
    },
    filename: function (req, file, cb) {
        let { originalname } = file;
        let fileExtension
        if (file.mimetype == "image/png") {
            fileExtension = '.png'
        } else if (file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            fileExtension = '.jpg'
        }
        let uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + fileExtension);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('File mimetype:', file.mimetype); // Debug log
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/octet-stream") {
            cb(null, true);
        } else {
            console.log('Rejected mimetype:', file.mimetype); // Debug log
            return cb(new Error('Invalid mime type'));
        }
    }
});

const uploadImage = upload.array('product_images', 6);

module.exports = uploadImage;