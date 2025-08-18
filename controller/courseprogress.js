const Course = require('../model/courses');
const CourseProg = require('../model/courseprogress');



const Getcourseprogress = async (req, res) => {


    try {

console.log("getcpdata triggered")
        const userId = req.id.id;

        const { courseId } = req.params;

        const courseprogress = await CourseProg.findOne({ userId, courseId }).populate('courseId').populate({
            path:'courseId',
            select:'Lectures'
        })
        console.log("kya hua ",courseprogress)

        if (!courseprogress) {
            console.log("kuch nhi")
          CourseProg.create({ userId, courseId })
        }
          console.log("tikh hai")
        return res.status(200).json({
            success: true,
            cp: courseprogress
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
const Updatecourseprogress = async (req, res) => {
    try {
        const { lectureId, courseId } = req.body;
        const userId = req.id.id;

        console.log("lectureId", lectureId);
        console.log("userId", courseId);

        const foundCourse = await Course.findById(courseId).populate('Lectures');
        if (!foundCourse) return res.status(404).json({ success: false, message: "Course not found" });




        let courseProgress = await CourseProg.findOne({ userId, courseId }).populate('lectureProgress.lectureId');
        console.log("courseProgress", courseProgress);
        if (!courseProgress) {
            console.log('gh')
            courseProgress = new CourseProg({
                userId,
                courseId,
                lectureProgress: [],
                completed: false,
            });
        }
        console.log(lectureId)


        const lectureIndex = courseProgress.lectureProgress.findIndex(
            lec => lec.lectureId === lectureId
        );
        if (lectureIndex === -1) {
            courseProgress.lectureProgress.push({ lectureId: lectureId, viewed: true });
            console.log("lecture added")
        } else {
            console.log("lecture found")
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        }


        if (courseProgress.lectureProgress.length === foundCourse.Lectures.length) {
            courseProgress.completed = true;
        }

        const mathsgot =
            ((courseProgress.lectureProgress.length / foundCourse.Lectures.length) * 100);
        console.log("mathsgot", mathsgot)
        courseProgress.courseprogresscompleted = Math.floor(mathsgot)
        await courseProgress.save();
        console.log("courseprogress", courseProgress)
        return res.status(200).json({
            success: true,
            progress: courseProgress,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    Updatecourseprogress,
    Getcourseprogress
};
