const Stripe = require('stripe');
const Profile = require('../model/profile');
const purchase = require('../model/purchase.js');
const Course = require('../model/courses');
const lecture = require('../model/lecture');
const Signup = require('../model/register')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CreateCheckOut = async (req, res) => {
    try {

        const { courseId } = req.body;
        const userId = req.id.id




        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(400).json({
                success: false,
                message: 'Course not found'
            });
        }
        coursetitle = course.CourseTitle;
        coursethumbnail = course.CourseThumbnail;
        courseprice = course.CoursePrice


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: String(coursetitle),
                            images: [coursethumbnail],
                        },
                        unit_amount: Math.max(courseprice, 1000) * 100 // ensures minimum ₹28

                    },
                    quantity: 1,
                },
            ],



            mode: 'payment',
            success_url: `http://localhost:5173/course-progress/${courseId}`,
            cancel_url: `http://localhost:5173/course-details/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId
            },
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
        });

        // Save purchase in DB
        const newPurchase = new purchase({
            courseId,
            userId,
            amount: courseprice,
            status: 'pending',
            paymentid: session.id
        });
        console.log("status", session)
        await newPurchase.save();

        // Send session URL to frontend
        return res.status(200).json({
            success: true,
            url: session.url
        });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const stripeWeb = async (req, res) => {
    let event;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET;

    console.log("🔑 endpointSecret:", endpointSecret);
    console.log("📩 Stripe signature:", sig);

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("✅ Verified event type:", event.type);
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("💳 Checkout Session Completed:", session.id);

        try {
            // ✅ Find purchase using session.id or payment_intent
            const purchaseDoc = await purchase
                .findOne({ paymentid: session.id }) // or session.payment_intent
                .populate({ path: "courseId" });

            if (!purchaseDoc) {
                console.log(`⚠️ No purchase found for session: ${session.id}`);
                return res.status(200).send(); // Acknowledge to avoid retries
            }

            // ✅ Update amount if exists
            if (session.amount_total) {
                purchaseDoc.amount = session.amount_total / 100; // convert from paise
                console.log("💰 Purchase amount updated:", purchaseDoc.amount);
            }

            // ✅ Mark purchase completed
            purchaseDoc.status = "completed";
            await purchaseDoc.save();
            console.log("✅ Purchase marked completed:", purchaseDoc._id);

            // ✅ Update lectures if exist
            if (purchaseDoc.courseId && purchaseDoc.courseId.Lectures?.length > 0) {
                await lecture.updateMany(
                    { _id: { $in: purchaseDoc.courseId.Lectures } },
                    { $set: { isPreview: true } }
                );
                console.log("📚 Lectures updated for course:", purchaseDoc.courseId._id);
            }

            // ✅ Enroll user into the course
            await Signup.findOneAndUpdate(
                { _id: purchaseDoc.userId },
                { $addToSet: { enrolledcourses: purchaseDoc.courseId } },
                { new: true }
            );
            console.log("👤 User enrolled:", purchaseDoc.userId);

            // ✅ Update course with enrolled student + course sold
            await Course.findByIdAndUpdate(
                purchaseDoc.courseId,
                {
                    $addToSet: {
                        enrolledStudents: purchaseDoc.userId,
                        coursesold: purchaseDoc._id,
                    },
                },
                { new: true }
            );
            console.log("📘 Course updated:", purchaseDoc.courseId);

            console.log(
                `🎉 Purchase confirmed for user: ${purchaseDoc.userId}, course: ${purchaseDoc.courseId}`
            );
        } catch (err) {
            console.error("❌ Error updating purchase:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // ✅ Always acknowledge Stripe
    return res.status(200).json({ received: true });
};



// // ✅ Get all purchased courses for a user
// const Getallpurchasedcourse = async (req, res) => {
//     try {
//         const userId = req.id.id;

//         const user = await Profile.findOne({ userid: userId }).populate("enrolledcourses");

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Unable to find the user",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Purchased courses found",
//             purchasecourse: user.enrolledcourses,
//         });
//     } catch (error) {
//         console.error("❌ Error in checking purchased course:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message,
//         });
//     }
// };

const Getallpurchasedcourse = async (req, res) => {

    try {
        const userId = req.id.id;

        const user = await Profile.findOne({ userid: userId }).populate('enrolledcourses');

        if (!user) {
            return res.status.json({
                success: false,
                message: "unable to find the user"
            })
        }

        return res.status(200).json({
            success: true,
            message: 'founded the purchased course',
            purchasecourse: user
        })

    } catch (error) {
        console.error("Error  in checking the purchased curse:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const Fetchedsoursesolddata = async (req, res) => {

    try {

        console.log("ticking")
        const userId = req.id.id;

        const allpurchasedcourse = await purchase.find({ status: 'completed' }).populate({
            path: 'courseId',
            select: 'Createdby CoursePrice CourseTitle Category CourseLevel CourseThumbnail enrolledStudents coursesold',
            populate: {
                path: 'coursesold',
                select: 'userId amount',
                populate: {
                    path: 'userId',
                    select: 'username photourl'
                }
            }
        });
        if (!allpurchasedcourse) {
            return res.status(200).json({
                success: true,
                message: 'Not sold any courses'
            });
        }
        const updata = allpurchasedcourse.forEach(data => {
            console.log("Course creator:", data.courseId?.Createdby?._id === userId);
        });

        console.log("allpurchasedcourse", allpurchasedcourse)
        console.log("userId", userId);
        // console.log("data?.Createdbysax",allpurchasedcourse?.courseId.Createdby?._id)
        const foundedalldata = allpurchasedcourse.filter((data) => {
            return (
                data?.courseId?.Createdby?._id?.toString() === userId.toString()
            );
        });

        console.log("foundeddata:", foundedalldata);

        return res.status(200).json({
            success: true,
            allpurchasedcourse: foundedalldata,
        })
    } catch (error) {
        console.error("Error  in checking the Fetchedsoursesolddata:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};




const checkcoursestatus = async (req, res) => {

    try {
        const userid = req.id.id
        const { courseId } = req.params

        const course = await Course.findById(courseId).populate('Lectures').populate('Createdby')

        if (!course) {
            return res.status(500).json({
                success: false,
                message: 'course not found'
            })
        }
        const checkstatus = await purchase.find({ courseId: courseId, userId: userid });

        if (checkstatus[0].status === 'pending' || checkstatus.length === 0) {
            console.log("hii hii ")
            return res.status(500).json({
                success: false,
            })
        }

        return res.status(200).json({
            success: true,
            course: course,

        })


    } catch (error) {
        console.error("Error  in checking the purchased curse:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

module.exports = {
    CreateCheckOut,
    stripeWeb,
    Getallpurchasedcourse,
    checkcoursestatus,
    Fetchedsoursesolddata
};

