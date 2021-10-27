const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const pool = require("./db");
const bcryptjs = require('bcryptjs')
app.use(express.json())
app.use(bodyParser.json())
const jwt = require("jsonwebtoken");

// const createToken = async() =>{
//     jwt.sign({},"")
// }

// createToken();
//-------------------------------------------------------------------------------STUDENTS TABLE----------------------------------------------------------------------------------------------//

//-------------------------------get all students

app.get('/students', async (req, res) => {
       pool.query("SELECT * FROM student", (error, results) => {
              if (error) {
                     throw error
              }
              res.status(200).json(results.rows)
       })
})



//--------------------------------create a student

app.post("/student", async (req, res) => {

       const { student_name, phone_no, email } = req.body

       pool.query('INSERT INTO student (student_name,phone_no,email) VALUES ($1, $2, $3)', [student_name, phone_no, email], (error) => {
              if (error) {
                     throw error
              }
              res.status(201).json({ status: 'success', message: 'Student Details Added' })
       })
})


//-------------------------------------------------------------------------------TUTORS TABLE----------------------------------------------------------------------------------------------//


//----------------------------------get all tutors

app.get('/tutors', async (req, res) => {
       pool.query("SELECT * FROM tutors", (error, results) => {
              if (error) {
                     throw error
              }
              res.status(200).json(results.rows)
       })
})




//--------------------------------------create a tutor

app.post("/tutor", async (req, res) => {

       const { tutor_name, phone_no, email } = req.body

       pool.query('INSERT INTO tutors (tutor_name,phone_no,email) VALUES ($1, $2, $3)', [tutor_name, phone_no, email], (error) => {
              if (error) {
                     throw error
              }
              res.status(201).json({ status: 'success', message: 'Tutor Details Added' })
       })
})




//-------------------------------------------------------------------------------COURSES TABLE----------------------------------------------------------------------------------------------//


//-------------------------------------------get all courses

app.get('/courses', async (req, res) => {
       pool.query("SELECT * FROM courses", (error, results) => {
              if (error) {
                     throw error
              }
              res.status(200).json(results.rows)
       })
})



//--------------------------------------create a course

app.post("/course", async (req, res) => {

       const { time_start, time_end, start_date, end_date, teacher, fees, rating_stars, subjects, class_, board, location, description } = req.body

       pool.query('INSERT INTO courses (time_start,time_end,start_date,end_date,teacher,fees,rating_stars,subjects,class_,board,location,description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [time_start, time_end, start_date, end_date, teacher, fees, rating_stars, subjects, class_, board, location, description], (error) => {
              if (error) {
                     throw error
              }
              res.status(201).json({ status: 'success', message: 'Course Details Added' })
       })
})

//-------------------------------------------------------------STARTING THE SERVER---------------------------------------------------------------------------------------------------//
app.listen(3000, () => {
       console.log("server is litsening on port:3000");
});



//-----------------------------------------------------Authentication-----------------------------------

app.post('/users/register', async (req, res) => {
       const { name, email, phone_no, password } = req.body;

       let errors = [];

       if (!name || !password || !password2 || (!email && !phone_no)) {
              errors.push({ message: "Please Enter All Fields!!" });
       }

       if (password < 8 && password2 > 14) {
              errors.push({ message: "Password Should be Between 8 to 14 Characters" });
       }

       if (password != password2) {
              errors.push({ message: "Passwords do not match" });
       }

       if (errors.length > 0) {
              res.send({ errors });
       }
       else {
              const passwordencrypt = await bcryptjs.hash(password, 10);
              pool.query(
                     'SELECT * FROM users WHERE (email=$1 OR phone_no=$2)', [email, phone_no], (err, results) => {
                            if (err) {
                                   throw err;
                            }
                            else {

                                   if (results.rows.length > 0) {
                                          errors.push({ message: "Email or Phone_no Already Exists" });
                                          //render back to same form and throw error
                                          res.send({ errors })
                                   }
                                   else {
                                          pool.query(
                                                 'INSERT INTO users (name, email,phone_no, password) VALUES ($1,$2,$3,$4)', [name, email, phone_no, passwordencrypt], (err, results) => {
                                                        if (err) {
                                                               throw err;
                                                        }
                                                        res.send({ message: "You are Successfully Registered" })
                                                 }
                                          )
                                   }
                            }
                     }
              )
       }
});


// login mobile screen
app.post('/users/login', async (req, res) => {
       const {username} = req.body;
       const users = await pool.query('SELECT * FROM users WHERE (email=$1 OR phone_no=$1)', [username]);
       if (users.rows.length === 0) return res.status(200).json({ message: "Email or phone_no not Registered" });
       else return res.status(200).json({message : "User already Registered"});
       //PASSWORD CHECKING 
       // const validPassword = await bcryptjs.compare(password,users.rows[0].password);
       // if (!validPassword) return res.status(401).json({ error: "Incorrect Password" });
       // return res.status(200).json({ message: "Login Sucessful" })
})


// login otp screen
app.post('/users/loginauth', async (req, res) => {
       const { username, password } = req.body;
       const users = await pool.query('SELECT * FROM users WHERE (email=$1 OR phone_no=$1)', [username]);
       //PASSWORD CHECKING 
       const validPassword = await bcryptjs.compare(password,users.rows[0].password);
       if (!validPassword) return res.status(401).json({ error: "Incorrect Password" });
       return res.status(200).json({ message: "Login Sucessful" })
})



app.post('/studyarea', async (req,res) =>{
       const { field, Class , board, user} = req.body;
       await pool.query('UPDATE student SET field=$1,standard=$2,board=$3 WHERE phone_no=$4',[field, Class , board, user], (err,results)=>{
              if(err){
                     throw err;
              }
              res.status(201).json({message: "Study Area Updated Successfully"});
       });
})




