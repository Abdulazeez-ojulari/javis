const { User, Token } = require("./userModel");
const errorMiddleWare = require("../middlewares/error");
// const Joi = require('joi');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const uuid = require("uuid");
const { Business } = require("../business/businessModel");
const { validationResult } = require("express-validator");

exports.signup = errorMiddleWare(async (req, res) => {
  const { firstName, lastName, email, phoneNo, password, confirm_password } =
    req.body;
  let id = uuid.v4() + uuid.v4();

  if (password !== confirm_password)
    return res.status(400).send({ message: "Confirm password" });

  let user = await User.findOne({ email: email });
  if (user)
    return res
      .status(400)
      .send({ message: "User already available with that email" });

  user = new User({
    userId: id,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNo: phoneNo,
    password: password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  let token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  let newtoken = await token.save();
  if (!newtoken) {
    // console.log(err.message)
    return res.status(500).send({ message: "Could not save user" });
  }
  await user.save();

  return res.send(user);
});

exports.login = errorMiddleWare(async (req, res) => {
  // const { error } = validateLogin(req.body);
  // if(error) return res.status(400).send({message: error.details[0].message});

  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).send({ message: "Invalid Email or Password" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword)
    return res.status(400).send({ message: "Invalid email or password" });

  if (!user.isVerified) {
    return res.status(401).send({ message: "Your email as not been verified" });
  }

  const business = await Business.find({ userId: user.id });
  const token = user.generateToken();
  res.set("Authorization", token);
  res.set("Access-Control-Expose-Headers", "Authorization");
  user["business"] = business;
  return res.send({ user: user, business: business });
});

exports.confirmEmail = errorMiddleWare(async (req, res) => {
  let token = await Token.findOne({ token: req.params.token });
  console.log(token);
  if (!token)
    return res
      .status(400)
      .send({ message: "Your token might have expired resend token" });

  const user = await User.findOne({ email: req.params.email });
  console.log(user);
  if (!user)
    return res.status(400).send({
      message: "'We are unable to find a user with that email please signup",
    });

  if (user.isVerified)
    return res.status(200).send({ message: "Your email as been verified" });

  user.isVerified = true;

  token = user.generateToken();
  res.set("x-auth-token", token);
  res.set("Access-Control-Expose-Headers", "x-auth-token");

  await user.save();

  res.send({ message: "email Verified" });
});

exports.resendEmail = errorMiddleWare(async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: "Email not found" });

  if (user.isVerified)
    return res.status(500).send({ message: "this email has been verified" });

  let token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  token.save(async function (err) {
    if (err) {
      console.log(err.message);
      return res.status(500).send({ message: err.message });
    }

    // let transporter = nodemailer.createTransport({
    //     host: "smtp.mailgun.org",
    //     port: 587,
    //     auth: {
    //         user: "postmaster@sandbox780556a00acb4453baf1e3c3216d4acb.mailgun.org",
    //         pass: "edd0d4950d9b19ee5a911d072ba1c4d5-d2cc48bc-c2c6bd0c"
    //     }
    // });

    // let mailOptions = {
    //     from: 'pelumifadolapo7@gmail.com',
    //     to: user.email,
    //     subject: 'Account Verification Link',
    //     text: 'Hello '+ user.firstname + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 'www.thehedgehog.xyz' + '\/confirm\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
    // };

    const msg = {
      from: "pelumifadolapo7@gmail.com",
      to: user.email,
      subject: "Account Verification Link",
      text:
        "Hello " +
        user.firstname +
        ",\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        "www.thehedgehog.xyz" +
        "/confirm/" +
        user.email +
        "/" +
        token.token +
        "\n\nThank You!\n",
    };
    //ES6
    sgMail.send(msg).then(
      async () => {
        await user.save();
        res.send({
          message:
            "A verification email has been sent to " +
            user.email +
            ". It will expire after one day",
        });
      },
      (error) => {
        console.error(error.response.body);

        return res.status(500).send({
          message:
            "Technical Issue!, Please click on resend for verifying your email.",
        });
      }
    );

    // transporter.sendMail(mailOptions, async function(err, info) {
    //     if(err) {
    //         return res.status(500)
    //         .send({ message: 'Technical Issue!, Please click on resend for verifying your email.'});
    //     }
    //     await user.save();

    //     res.send({message: 'A verification email has been sent to ' + user.userEmail + '. It will expire after one day'});
    // })
  });
});

module.exports.findAll = errorMiddleWare(async (req, res) => {
  const users = await User.find({ isVerified: true });
  res.send(users);
});

exports.forgotPassword = errorMiddleWare(async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: "Email not found" });

  if (!user.isVerified)
    return res
      .status(500)
      .send({ message: "this email has not been verified" });

  let token = new Token({
    userId: user.id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  token.save(async function (err) {
    if (err) {
      console.log(err.message);
      return res.status(500).send({ message: err.message });
    }

    // let transporter = nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //         user: 'pelumifadolapo7@gmail.com',
    //         pass: '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'
    //     }
    // });

    // let mailOptions = {
    //     from: 'pelumifadolapo7@gmail.com',
    //     to: user.email,
    //     subject: 'Password Reset Link',
    //     text: 'Hello '+ user.firstname + ',\n\n' + 'Please reset your password by clicking the link: \nhttp:\/\/' + 'www.thehedgehog.xyz' + '\/reset-password\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
    // };

    const msg = {
      from: "pelumifadolapo7@gmail.com",
      to: user.email,
      subject: "Password Reset Link",
      text:
        "Hello " +
        user.firstname +
        ",\n\n" +
        "Please reset your password by clicking the link: \nhttp://" +
        "www.thehedgehog.xyz" +
        "/reset-password/" +
        user.email +
        "/" +
        token.token +
        "\n\nThank You!\n",
    };
    //ES6
    sgMail.send(msg).then(
      async () => {
        await user.save();
        res.send({
          message:
            "A password reset email has been sent to " +
            user.email +
            ". It will expire after one day",
        });
      },
      (error) => {
        console.error(error.response.body);

        return res.status(500).send({
          message:
            "Technical Issue!, Please click on resend for verifying your email.",
        });
      }
    );
    //ES8
    // (async () => {
    //     try {
    //       await sgMail.send(msg);
    //     } catch (error) {
    //       console.error(error);

    //       if (error.response) {
    //         console.error(error.response.body)
    //       }
    //     }
    // })();

    // mailchimp.messages.send({
    //     key: '86b19f73ddffe83b5d34bfaab6a6826c-us14',
    //     message: {
    //         from: 'pelumifadolapo7@gmail.com',
    //         to: user.email,
    //         subject: 'Password Reset Link',
    //         text: 'Hello '+ user.firstname + ',\n\n' + 'Please reset your password by clicking the link: \nhttp:\/\/' + 'www.thehedgehog.xyz' + '\/reset-password\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
    //     }
    // }).then(async response => {
    //     await user.save();

    //     res.send({message: 'A password reset email has been sent to ' + user.email + '. It will expire after one day'});
    // }).catch(err => {
    //     return res.status(500)
    //         .send({ message: 'Technical Issue!, Please click on resend for verifying your email.'});
    // })
    // console.log(response);

    // transporter.sendMail(mailOptions, async function(err, info) {
    //     if(err) {
    //         console.log(err)
    //         return res.status(500)
    //         .send({ message: 'Technical Issue!, Please click on resend for verifying your email.'});
    //     }
    //     await user.save();

    //     res.send({message: 'A password reset email has been sent to ' + user.email + '. It will expire after one day'});
    // })
  });
});

// exports.passwordVerify = errorMiddleWare( async (req, res) => {
//     let token = await Token.findOne({token: req.params.token})
//     if(!token) return res.status(400).send({message: 'Your token might have expired resend token'});

//     const user = await User.findOne({email: req.params.email });
//     if(!user) return res.status(400).send({ message: "'We are unable to find a user with that email please signup" });

//     res.send({message: 'Valid'})
// });

exports.resetPassword = errorMiddleWare(async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send({ message: "User not available with that email" });

  const salt = await bcrypt.genSalt(10);
  let password = await bcrypt.hash(req.body.password, salt);
  await User.findOneAndUpdate(
    { email: req.body.email },
    { password: password }
  );

  await Token.findOneAndDelete({ token: req.body.token });

  res.send({ message: "successful" });
});

// function validate(user){
//     const schema = Joi.object({
//         firstname: Joi.string().min(3).max(50).required(),
//         lastname: Joi.string().min(3).max(50).required(),
//         email: Joi.string().email().min(3).max(255).required(),
//         role: Joi.string().min(3).max(50).required(),
//         department: Joi.string().min(3).max(50).required(),
//         password: Joi.string().min(8).max(1024).required(),
//         confirm_password: Joi.string().min(8).max(1024).required()
//         // userAddress: Joi.string().min(10).max(1024),
//         // userPhoneNo: Joi.string().min(7).max(15)
//     })

//     return schema.validate(user);
// }

// function validateLogin(user){
//     const schema = Joi.object({
//         email: Joi.string().email().min(3).max(255).required(),
//         password: Joi.string().min(8).max(1024).required()
//     })

//     return schema.validate(user);
// }

exports.fetchAdminList = errorMiddleWare(async (req, res) => {
  const { businessId } = req.params;
  const business = await Business.findOne({ businessId: businessId }).populate(
    "teams.userId"
  );
  if (!business) {
    return res.status(404).json({ message: "Invalid business ID provided" });
  }
  const administrators = business.teams.filter(
    (team) => team.role === "administrator" || team.role === "owner"
  );
  // console.log(administrators);

  return res
    .status(200)
    .json({ message: "Administrators fetched successfully", administrators });
});

// exports.removeAdmin = errorMiddleWare(async (req, res) => {
//   const { businessId, teamId } = req.params;
//   const business = await Business.findById(businessId);
//   if (!business) {
//     return res.status(404).json({ message: "Invalid business ID provided" });
//   }

//   const teamIndex = business.teams.findIndex(
//     (team) => team._id.toString() === teamId
//   );

//   if (teamIndex === -1) {
//     // throw new Error("Team not found in the business");
//     return res.status(404).json({ message: "Team member not found" });
//   }

//   // Remove the team from the 'teams' array
//   business.teams.splice(teamIndex, 1);

//   // Save the updated business document
//   await business.save();

//   return res
//     .status(200)
//     .json({ message: "Team removed from the business successfully" });
// });

exports.changePassword = errorMiddleWare(async (req, res) => {
  const { user } = req;
  const errors = validationResult(req);
  const { oldPassword, newPassword } = req.body;

  if (!errors.isEmpty()) {
    let validationErrors = [];
    for (const error of errors.array()) {
      validationErrors.push({ field: error.path, message: error.msg });
    }
    return res
      .status(400)
      .json({ message: "Bad Request", data: validationErrors });
  }

  const userInfo = await User.findOne({ userId: user.userId });

  if (oldPassword === newPassword) {
    return res
      .status(422)
      .json({ message: "old password can not be same as new password" });
  }

  // Check if the old password matches the stored password
  const passwordMatch = await bcrypt.compare(oldPassword, userInfo.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid old password" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  userInfo.password = hashedPassword;

  await userInfo.save();

  return res.status(200).json({
    message: "Password changed successfully",
    userInfo,
    passwordMatch,
  });
});
