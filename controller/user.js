
const Signup = require("../model/register")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Profile = require("../model/profile")
const { Uploadmedia, deletemedia } = require("../utils/cloudinary")


const signupcontroller = async (req, res) => {
    console.log("req.body", req.body)
     try {
          const { email, username, password, phonenumber,Role } = req.body;
        if (!email || !username || !password || !phonenumber ||!Role) {
            return res.status(400).json({
                success: false,
                message: 'please filled all the data carefully'
            })
        }

        const existinguser = await Signup.findOne({ email: email });
        if (existinguser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            })
        }


        let hashedpassword;
        try {
            hashedpassword = await bcrypt.hash(password, 10);

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: " Internal server error while hashing the password"
            })

        }


        const User = await Signup.create({
            email,
            username,
            phonenumber,
            password: hashedpassword,
            Role:Role,
        })
        console.log("user Created",User)

   
            await User.save();
    
        console.log("user Created",User)

   
 
        return res.status(200).json({
            success: true,
            message: 'user registered successfully',
        })



    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal sever error"
        })
    }
}






const Logincontroller = async (req, res) => {
    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "please filled all the data carefully"
            })
        }




        const existingUser = await Signup.findOne({ email });



        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "user not found with this details",
            })
        }





        const ispasswordcorrect = await bcrypt.compare(password, existingUser.password);
        if (!ispasswordcorrect) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password filled ",
            })
        }
        console.log("login request recived:", existingUser);



        const payload = {
            id: existingUser._id,
            name: existingUser.username,
            email: existingUser.email,
        };

        const token = jwt.sign(payload, process.env.jwt_secret, {
            expiresIn: "24h"
        })

        console.log("Login successful:", token);
        const options = {
            path: "/",
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
            secure: true,      // HTTPS = true, Localhost = false
            sameSite: "none"     // Use 'lax' for same-site localhost dev
        };

        res.cookie("babbarCookie", token, options).status(200).json({
            success: true,
            token,
            existingUser,
            message: "User logged in successfully",
        });







    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "internal server error",
        })

    }
}



const Logoutcontroller = async (req, res) => {
    try {
        console.log("logout trigger");
        res.clearCookie('babbarCookie', {
            httpOnly: true,
            sameSite: 'strict',
            path: '/', // if used during set
        });

        console.log("logoutsuccessful", req.id)


        return res.status(200).json({
            success: true,
            message: "logout successfullly"
        })




    } catch (error) {
        console.log("error incxhbj logout", error)
        return res.status(500).json({
            success: false,
            message: "error in while getting logout"
        })
    }
}



const GetUserProfile = async (req, res) => {
    try {
        const userid = req.id.id; // user ID extracted from request (e.g., JWT payload)

        const profile = await Signup.findById(userid).populate('enrolledcourses');

        console.log("profile", profile);
        if (!profile) {
            console.log("not getting the profile", profile)
            return res.status(404).json({
                success: false,
                  message: "User profile not found",
            });
        }

        console.log("profile");

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            profile,
        });
    } catch (error) {
        console.log("Error in getting profile", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching profile",
        });
    }
};


const UpdateProfile = async (req, res) => {
    console.log("req.body", req.body)
    try {
        const userid = req.id.id;
        const { username } = req.body;
        const photourlfirst = req.file;


        const user = await Signup.findOne({ _id: userid });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }


        // Delete the old file from Cloudinary if photourl exists
        if (user.photourl) {
            const publicuid = user.photourl.split('/').pop().split('.')[0];
            deletemedia(publicuid); // make sure deletemedia handles errors gracefully
        }

        let updatedata = { username };



        // If a new photo is uploaded, upload to cloudinary and update photourl
        if (photourlfirst) {
            const cloudresponse = await Uploadmedia(photourlfirst.path);
            updatedata.photourl = cloudresponse.secure_url;
            updatedata.url = cloudresponse.url;
            console.log("Uploaded to Cloudinary URL:", updatedata.photourl);
        }



        const updateuser = await Signup.findByIdAndUpdate({ _id: userid }, updatedata, { new: true }).select("-password");
        console.log("updateuser", updateuser)
        return res.status(200).json({
            success: true,
            message: "Data updated successfully",
            user: updateuser,
        });

    } catch (error) {
        console.log("Error in updating profile", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating profile",
        });
    }
};
module.exports = { signupcontroller, Logincontroller, Logoutcontroller, GetUserProfile, UpdateProfile };
