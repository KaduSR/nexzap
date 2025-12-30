import multer from 'multer';

const upload = multer({
  dest: 'uploads/' // Specify a destination folder for uploads
});

export default upload;