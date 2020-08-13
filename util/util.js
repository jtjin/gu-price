require('dotenv').config('../');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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
    return { error };
  }
};

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb('Error: Allow images only of extensions jpeg|jpg|png !');
};

const multerConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagePath = path.join(__dirname, '../static/pictures');
    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath);
    }
    cb(null, imagePath);
  },
  filename: (req, file, cb) => {
    const customFileName = crypto.randomBytes(18).toString('hex').substr(0, 8);
    const fileExtension = file.mimetype.split('/')[1]; // get file extension from original file name
    cb(null, `${customFileName}.${fileExtension}`);
  },
});

const upload = multer({
  storage: multerConfig,
  fileFilter,
});

const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = {
  send,
  upload,
  asyncHandler,
};
