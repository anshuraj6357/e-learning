
const { Uploadmedia } = require("../utils/cloudinary");

const UploadindVideo= async (req, res) => {
try {
      const videoFile = req.file;
      if (!videoFile) {
        return res.status(400).json({ success: false, message: "Video not received" });
      }

      const uploadResponse = await Uploadmedia(videoFile.buffer || videoFile.path);

      return res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        uploadedfile: uploadResponse,
          });
    } catch (error) {
     
      return res.status(500).json({ success: false, message: "Video upload failed" });
    }
  }


  module.exports={UploadindVideo}
