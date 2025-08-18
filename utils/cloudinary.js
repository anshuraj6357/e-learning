const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

 const Uploadmedia=async(file)=>{
    try {
        const UploadResponce=await  cloudinary.uploader.upload(file,{
            resource_type:'auto',
        })
       console.log("UploadResponce",UploadResponce)
        return UploadResponce;
        
    } catch (error) {
        console.log("error in uploading the media",error);
        return res.status(400).json({
                success: false,
                message: 'error in uploading the media'
            })
        
    }
}


 const deletemedia=async(publicuid)=>{
    try {
        const DeleteResponce=await cloudinary.uploader.destroy(publicuid,{
            resource_type:'image',
        })
        return DeleteResponce;
        
    } catch (error) {
        console.log("error in uploading the media",error);
        return res.status(400).json({
                success: false,
                message: 'error in uploading the media'
            })
        
    }
}


module.exports = { Uploadmedia,deletemedia };


