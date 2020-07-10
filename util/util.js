require('dotenv').config('../');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send = async (mail) => {
  try {
    const info = await transporter.sendMail(mail);
    return { info, status: 'mail sent' };
  } catch (error) {
    console.log(error);
    throw (`Unable to send email: ${error}`);
  }
};

const s3Config = new AWS.S3({
  accessKeyId: process.env.S3_AWS_ACCESS_KEY,
  secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY,
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
      return cb(null, true);
  } else {
      cb("Error: Allow images only of extensions jpeg|jpg|png !");
  }
}

const multerS3Config = multerS3({
  s3: s3Config,
  acl: 'public-read',
  bucket: process.env.S3_Bucket,
  metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
      const fullPath = `test/${file.originalname}`;
      cb(null, fullPath)
  }
});

const uploadS3 = multer({
  storage: multerS3Config,
  fileFilter: fileFilter,
  limits: {
      fileSize: 1024 * 1024 * 5
  }
})

const wrapAsync = (fn) => function (req, res, next) {
  fn(req, res, next).catch(next);
};

module.exports = {
  send,
  uploadS3,
  wrapAsync,
};
