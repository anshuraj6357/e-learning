const Course = require('../model/courses');
const lecture = require('../model/lecture');
const Profile = require('../model/profile');
const { Uploadmedia, deletemedia } = require("../utils/cloudinary")

const CourseControlller = async (req, res) => {
    try {

        const { CourseTitle, Category } = req.body;

        if (!CourseTitle || !Category) {
            return res.status(401).json({
                success: false,
                message: "course not created "
            })
        }

        const Created = await Course.create({
            CourseTitle,
            Category,
            Createdby: req.id.id,
        })

        await Created.save();
        return res.status(200).json({
            success: true,
            message: "course created successfully",
            course: Created
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "course created failed",
        })

    }
}


const Getcoursecreatordetai = async (req, res) => {
    try {

        const { userId } = req.params;



        const user = await Profile.findOne({ userid: userId }).populate("userid")

        if (!user) {
            return res.status(400).json({
                success: false,
                mesage: "not able to find the user "
            })
        }

        return res.status(200).json({
            success: true,
            userdetail: user.userid
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            mesage: 'internal server erroe'
        })

    }

}


const GetAallCourses = async (req, res) => {

    try {

        const userid = req.id.id;

        const courses = await Course.find({ Createdby: userid }).populate('Createdby');
        if (!courses) {
            return res.status(400).json
                ({
                    success: false,
                    message: "error in getting the createdby"
                })
        }

        return res.status(200).json({
            success: true,
            message: "course fetched successfully",
            course: courses
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "course fetched failed",
        })

    }
}

const GetAllpublishedcourse = async (req, res) => {
    try {
        const allpublishedcourses = await Course.find({ isPublished: true })
        if (!allpublishedcourses) {
            return res.status(400).json({
                success: false,
                message: "no course published till now"
            })
        }
        return res.status(200).json({
            success: true,
            message: "all the published courses are",
            published: allpublishedcourses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "unable to fetch the purchased courses"
        })
    }
}

const Editcourse = async (req, res) => {
    try {
        const courseid = req.params.courseId;

        const {
            CourseTitle,
            CourseSubtitle,
            Description,
            Category,
            CourseLevel,
            CoursePrice,
            isPublished,
        } = req.body
        const Thumbnail = req.file;
        if (
            !CourseTitle ||
            !CourseSubtitle ||
            !Description ||
            !Category ||
            !CourseLevel ||
            !CoursePrice
        ) {
            return res.status(400).json({
                success: false,
                message: "please filled all the data"
            })
        }
        let updatedata = {
            CourseTitle,
            CourseSubtitle,
            Description,
            Category,
            CourseLevel,
            CoursePrice,
            isPublished,
        }
        const coursefound = await Course.findById({ _id: courseid })

        if (coursefound.CourseThumbnail) {
            const publicid = coursefound.CourseThumbnail.split('/').pop().split('.')[0];
            await deletemedia(publicid);

        }
        if (Thumbnail) {
            const file = Thumbnail.path;
            const uploadresponse = await Uploadmedia(file);
            updatedata.CourseThumbnail = uploadresponse.secure_url;
        }
        const updatedcourse = await Course.findByIdAndUpdate({ _id: courseid }, updatedata, { new: true })

        await updatedcourse.save();
        return res.status(200).json({
            success: true,
            message: "course data uloaded successfully",
            course: updatedcourse,
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "course updation failed,try again",
        })

    }
}

const PublishStateHandler = async (req, res) => {
    try {

        const { courseId } = req.params

        const { publish } = req.query;

        const foundcourse = await Course.findById(courseId);
        if (publish === "true") {
            foundcourse.isPublished = true;
        }
        else {
            foundcourse.isPublished = false;
        }



        await foundcourse.save();

        return res.status(200).json({
            success: true,
            message: `Course is now ${foundcourse.isPublished ? 'published' : 'unpublished'}`,
            publishedcourse: foundcourse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "unable to published the course course,try again later ",
        })

    }
}

const GetCourse = async (req, res) => {
    try {

        const courseId = req.params.courseId.replace(/^:/, "");


        const fetchcourse = await Course.findOne({ _id: courseId }).populate("Lectures");


        if (!fetchcourse) {
            return res.status(400).json({
                success: false,
                message: "course not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            course: fetchcourse
        })

    } catch (error) {
     return res.status(500).json({
            success: false,
            message: "unable to load course,try again later ",
        })

    }
}

const Createlectures = async (req, res) => {
    try {
        const lectureTitle = req.body.lectureTitle;
        const courseid = req.params.courseId;

        if (!lectureTitle) {
            return res.status(400).json({
                success: false,
                message: 'lecture title is required'
            })
        }
        const lecturecreated = await lecture.create({ lectureTitle: lectureTitle })
        const foundcourse = await Course.findById(courseid);
       
        if (!foundcourse) {
            return res.status(400).json({
                success: false,
                message: 'unable to find the course ,Server Busy'
            })
        }

        foundcourse.Lectures.push(lecturecreated._id)

        await foundcourse.save();




        return res.status(200).json({
            success: true,
            message: "lecture created successfully",
        })
    } catch (error) {
     
        return res.status(500).json({
            success: false,
            message: "unable to upload the lectures ",
        })

    }
}

const RemoveCoursed = async (req, res) => {
    try {
      
        const { courseId } = req.params;
      
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(400).json({
                success: false,
                mesage: "unable to find the course"
            })
        }
        return res.status(200).json({
            success: true,
            message: "course removed successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "unable to remove the course",
        })

    }
}

const Getcourselecture = async (req, res) => {
    try {
        const courseId = req.params.courseId;
     
        const fetchedcourselectures = await Course.findById(courseId).populate('Lectures'); 

        if (!fetchedcourselectures) {
            return res.status(400).json({
                success: false,
                message: 'not getting the course'
            })
        }
        return res.status(200).json({
            success: true,
            message: "All the lectures are",
            Lectures: fetchedcourselectures.Lectures
        })

    } catch (error) {
     
        return res.status(500).json({
            success: false,
            message: "unable to Error in fetching all  the lectures ",
        })

    }
}


const IsPublishedCourse = async (req, res) => {
    try {
        const findpublishedcourse = await Course.find({ isPublished: true });
        if (!findpublishedcourse) {
            return res.status(400).json({
                success: false,
                message: 'no course Available'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'courses founded',
            publishedcourse: findpublishedcourse
        })

    } catch (error) {
     return res.status(500).json({
            success: false,
            message: "unable to fetching  the published course ",
        })

    }
}


const Searchedcourses = async (req, res) => {

    try {
        const { query } = req.query;

        const searchedcourse = await Course.find({
            isPublished: true,
            $or: [
                { CourseTitle: { $regex: query, $options: 'i' } },
                { Category: { $regex: query, $options: 'i' } },
                { CourseSubtitle: { $regex: query, $options: 'i' } },
            ]
        })
        if (!searchedcourse) {
            return res.status(200).json({
                success: true,
                message: "no courses are available"
            })
        }
        return res.status(200).json({
            success: true,
            message: "courses found successfully",
            searchedcourse: searchedcourse
        })

    } catch (error) {
       
        return res.status(500).json({
            success: false,
            message: "unable to searched the  course ",
        })

    }
}



module.exports = {
    CourseControlller,
    Searchedcourses,
    RemoveCoursed,
    GetAallCourses,
    Editcourse,
    GetCourse,
    Createlectures,
    Getcourselecture,
    PublishStateHandler,
    IsPublishedCourse,
    GetAllpublishedcourse,
    Getcoursecreatordetai
};

