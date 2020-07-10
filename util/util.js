require('dotenv').config('../');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
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

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_AWS_ACCESS_KEY,
  secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY,
});

const uploadS3 = multer({
  storage: multerS3({
    s3,
    acl: 'public-read',
    bucket: process.env.S3_Bucket,
    metadata: (req, file, callBack) => {
      callBack(null, { fieldName: file.fieldname });
    },
    key: (req, file, callBack) => {
      const fullPath = `test/${file.originalname}`;
      callBack(null, fullPath);
    },
  }),
});

const wrapAsync = (fn) => function (req, res, next) {
  fn(req, res, next).catch(next);
};

module.exports = {
  send,
  uploadS3,
  wrapAsync,
};
