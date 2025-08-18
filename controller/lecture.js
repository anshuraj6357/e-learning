const Course = require('../model/courses');
const lecture = require('../model/lecture');
const { Uploadmedia, deletemedia } = require("../utils/cloudinary")




const EditLectures = async (req, res) => {
    try {
        const { isPreview, lectureTitle, videoinfo } = req.body;
        console.log("isPreview yahi hai ", isPreview);
        const { courseId, lectureId } = req.params;

        const foundlecture = await lecture.findById(lectureId);

        if (lectureTitle) {
            foundlecture.lectureTitle = lectureTitle
        }
        foundlecture.isPreview = isPreview;
        if (videoinfo) {
            console.log("videoinfo.videoUrl", videoinfo.secure_url)
            console.log("videoinfo.publicid", videoinfo.public_id)
            if (videoinfo.secure_url) foundlecture.videoUrl = videoinfo.secure_url;

            if (videoinfo.public_id) foundlecture.publicid = videoinfo.public_id;
        }

        await foundlecture.save();


        const course = await Course.findById(courseId);

        if (course && !course.Lectures.includes(lecture._id)) {
            course.Lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            success: true,
            message: 'course uploaded successfully',
            foundlecture: foundlecture
        })

    } catch (error) {
        console.log("Error in fetching lectures", error);
        return res.status(500).json({
            success: false,
            message: "unable to upload the lectures ",
        })

    }
}


const Getcoursebylecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const getlecture = await lecture.findById(lectureId);
        if (!getlecture) {
            return res.status(400).json({
                success: false,
                message: 'not able to get the lectures'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'fetch lecture successfully',
            lecture: getlecture
        })

    } catch (error) {
        console.log("Error in fetching lectures", error);
        return res.status(500).json({
            success: false,
            message: "unable to get lectures ",
        })

    }
}


const RemoveLectures = async (req, res) => {
    try {

        const { lectureId } = req.params;

        const deletelecture = await lecture.findByIdAndDelete(lectureId)
        if (!deletelecture) {
            return res.status(400).json({
                success: false,
                message: "not able to delete lecture,try again"
            })
        }

        if (lecture.publicid) {
            await deletemedia(lecture.publicid);
        }
        await Course.updateOne(
            { Lectures: lectureId },
            { $pull: { Lectures: lectureId } }
        )
        console.log("deleted successfully")
        return res.status(200).json({
            success: true,
            message: 'lecture deleted successfully'
        })


    } catch (error) {
        console.log("Error in fetching all lectures", error);
        return res.status(500).json({
            success: false,
            message: "unable to remove the lectures ",
        })

    }
}
module.exports = { EditLectures, RemoveLectures, Getcoursebylecture };
