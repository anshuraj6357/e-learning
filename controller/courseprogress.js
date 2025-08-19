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
      

        if (!courseprogress) {
        
          CourseProg.create({ userId, courseId })
        }
       
        return res.status(200).json({
            success: true,
            cp: courseprogress
        })
    } catch (error) {
    
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
const Updatecourseprogress = async (req, res) => {
    try {
        const { lectureId, courseId } = req.body;
        const userId = req.id.id;

       

        const foundCourse = await Course.findById(courseId).populate('Lectures');
        if (!foundCourse) return res.status(404).json({ success: false, message: "Course not found" });




        let courseProgress = await CourseProg.findOne({ userId, courseId }).populate('lectureProgress.lectureId');
     
        if (!courseProgress) {
          
            courseProgress = new CourseProg({
                userId,
                courseId,
                lectureProgress: [],
                completed: false,
            });
        }
     


        const lectureIndex = courseProgress.lectureProgress.findIndex(
            lec => lec.lectureId === lectureId
        );
        if (lectureIndex === -1) {
            courseProgress.lectureProgress.push({ lectureId: lectureId, viewed: true });
           
        } else {
         
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        }


        if (courseProgress.lectureProgress.length === foundCourse.Lectures.length) {
            courseProgress.completed = true;
        }

        const mathsgot =
            ((courseProgress.lectureProgress.length / foundCourse.Lectures.length) * 100);

        courseProgress.courseprogresscompleted = Math.floor(mathsgot)
        await courseProgress.save();

        return res.status(200).json({
            success: true,
            progress: courseProgress,
        });

    } catch (error) {
     
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    Updatecourseprogress,
    Getcourseprogress
};
