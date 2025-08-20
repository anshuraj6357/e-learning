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

            success_url: `hhttps://e-learning-student-peach.vercel.app/course-progress/${courseId}`,

            cancel_url: `https://e-learning-student-peach.vercel.app/course-details/${courseId}`,
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

        await newPurchase.save();

        // Send session URL to frontend
        return res.status(200).json({
            success: true,
            url: session.url
        });

    } catch (error) {

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

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      try {
        const purchaseDoc = await purchase
          .findOne({ paymentid: session.id })
          .populate({ path: "courseId" });

        if (!purchaseDoc) return res.status(200).send();

        if (session.amount_total) {
          purchaseDoc.amount = session.amount_total / 100;

        }

        purchaseDoc.status = "completed";
        await purchaseDoc.save();

        if (purchaseDoc.courseId?.Lectures?.length > 0) {
          await lecture.updateMany(
            { _id: { $in: purchaseDoc.courseId.Lectures } },
            { $set: { isPreview: true } }
          );
        }

        await Signup.findOneAndUpdate(
          { _id: purchaseDoc.userId },
          { $addToSet: { enrolledcourses: purchaseDoc.courseId } },
          { new: true }
        );

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
      } catch (err) {
        console.error("Webhook DB update error:", err.message);
      }
      break;
    }

    case "payment_intent.succeeded":
      console.log("Payment succeeded:", event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};



const Fetchedsoursesolddata = async (req, res) => {

    try {


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


        const foundedalldata = allpurchasedcourse.filter((data) => {
            return (
                data?.courseId?.Createdby?._id?.toString() === userId.toString()
            );
        });


        return res.status(200).json({
            success: true,
            allpurchasedcourse: foundedalldata,
        })
    } catch (error) {
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

            return res.status(500).json({
                success: false,
            })
        }

        return res.status(200).json({
            success: true,
            course: course,

        })


    } catch (error) {

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
    // Getallpurchasedcourse,
    checkcoursestatus,
    Fetchedsoursesolddata
};







