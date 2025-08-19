
const Signup = require("../model/register")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Profile = require("../model/profile")
const { Uploadmedia, deletemedia } = require("../utils/cloudinary")


const signupcontroller = async (req, res) => {
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
      
            await User.save();
    
      
   
 
        return res.status(200).json({
            success: true,
            message: 'user registered successfully',
        })



    } catch (error) {
      
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
    

        const payload = {
            id: existingUser._id,
            name: existingUser.username,
            email: existingUser.email,
        };

        const token = jwt.sign(payload, process.env.jwt_secret, {
            expiresIn: "24h"
        })
   const options = {
            path: "/",
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
            secure: true,    
            sameSite: "none"    
        };

        res.cookie("babbarCookie", token, options).status(200).json({
            success: true,
            token,
            existingUser,
            message: "User logged in successfully",
        });







    } catch (error) {
     
        return res.status(500).json({
            success: false,
            message: "internal server error",
        })

    }
}



const Logoutcontroller = async (req, res) => {
    try {
   
        res.clearCookie('babbarCookie', {
            httpOnly: true,
            sameSite: 'strict',
            path: '/', // if used during set
        });


        return res.status(200).json({
            success: true,
            message: "logout successfullly"
        })




    } catch (error) {
    
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

        if (!profile) {
    return res.status(404).json({
                success: false,
                  message: "User profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            profile,
        });
    } catch (error) {
           return res.status(500).json({
            success: false,
            message: "Error occurred while fetching profile",
        });
    }
};


const UpdateProfile = async (req, res) => {
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

   if (user.photourl) {
            const publicuid = user.photourl.split('/').pop().split('.')[0];
            deletemedia(publicuid); 
        }

        let updatedata = { username };

       if (photourlfirst) {
            const cloudresponse = await Uploadmedia(photourlfirst.path);
            updatedata.photourl = cloudresponse.secure_url;
            updatedata.url = cloudresponse.url;
             }



        const updateuser = await Signup.findByIdAndUpdate({ _id: userid }, updatedata, { new: true }).select("-password");
            return res.status(200).json({
            success: true,
            message: "Data updated successfully",
            user: updateuser,
        });

    } catch (error) {
            return res.status(500).json({
            success: false,
            message: "Error occurred while updating profile",
        });
    }
};
module.exports = { signupcontroller, Logincontroller, Logoutcontroller, GetUserProfile, UpdateProfile };
