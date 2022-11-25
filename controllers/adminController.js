const db = require("../dbconfig");
const { isEmail, isEmpty } = require("validator");
const Knex = require("knex");
const nodemailer = require("nodemailer");

const checkEmail = (email) => {
  let valid = true;
  if (isEmpty(email) || !isEmail(email)) {
    valid = false;
  }
  return valid;
};

const allUsers = async (req, res) => {
  const users = await db("users");
  res.json(users.filter((user) => user.name != "admin"));
};

const withdrwal = async (req, res) => {
  const users = await db("users");
  res.json(users.filter((user) => user.withdrwal > 0 && user.name != "admin"));
};

const deposited = async (req, res) => {
  const users = await db("users");
  res.json(
    users.filter((user) => user.deposit > 0 && user.name != "ad@test.com")
  );
};

const sendingMsg = (name, value, heading, email) => {
  if(value > 0){
    const themsg = `Your ${name} of ${value}USD has been approved for your account. 
    \nThank you for choosing Tynko Traders . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@Tynko Traders \n

\nRegards, 
\nTynko Traders`
    
sendMailx(themsg, email, '', heading);
  }
} 

const editUser = async (req, res) => {
  const { email, name, deposit, profits, withdrwal, referral, joined, pdgwdl, due } =
    req.body;

  console.log("edit emaila", req.body);

  if (checkEmail(email)) {
    try {
      let depositx = 0
      let withdrwalx = 0
      let profitsx = 0

      try{
        depositx = deposit  -  parseInt((await db("users").where({ email }))[0].deposit);
      withdrwalx =  withdrwal - parseInt((await db("users").where({ email }))[0].withdrwal);
      profitsx =  profits - parseInt((await db("users").where({ email }))[0].profits ) ;
      console.log({depositx})
      console.log({withdrwalx})
      console.log({profitsx})
      }catch(e){
          console.log('out here')
      }
      //returns 1 if done
      const isDone = await db("users")
        .where({ email })
        .update({ email, name, deposit, profits, withdrwal, referral, joined, pdgwdl, due });
      
    

      sendingMsg('deposit', depositx, 'Update on Deposit',email)
      sendingMsg('withdrawal', withdrwalx, 'Update on Withdrawal',email)
      sendingMsg('profit', profitsx , 'Update on Profit',email)
      res.json(isDone);
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const del = async (req, res) => {
  const { email } = req.body;
  try {
    //if not the admin delete
    isdeleted = await db("users").where({ email }).del();
    if (isdeleted) {
      res.json({ msg: "success" });
    } else {
      res.json({ msg: "failed" });
    }
  } catch (err) {
    res.json({ msg: "failed" });
  }
};

const address = async (req, res) => {
  const { address } = req.body;
  try {
    const done = await db("users")
      .where({ email: "tests@test.com" })
      .update({ address });
    res.json({ done });
  } catch (err) {
    res.json({ err: "cant change address at this time" });
  }
};

const getAddress = async (req, res) => {
  try {
    const address = (await db("users").where({ email: "tests@test.com" }))[0]
      .address;
    res.json({ address });
  } catch (err) {
    res.json({ err: "cant get address at this time" });
  }
};

const sendMailx = async (output, email, h, s) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "tynkotraders.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@tynkotraders.com",
        pass: "ethereal$12", // generated ethereal password
      },
    });

    let info = await transporter.sendMail({
      from: '"Tynko Traders" <support@tynkotraders.com>', // sender address
      to: email, // list of receivers
      subject: s, // Subject line
      text: output, // plain text body
      html: h,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  allUsers,
  editUser,
  del,
  withdrwal,
  address,
  getAddress,
  deposited,
};
