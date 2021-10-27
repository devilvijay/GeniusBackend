const express = require("express");
const cors = require('cors');
const env = require('./env');
const pool = require('./app/db/pool');
const app = express();
const auth = require('./app/middlewares/verifyAuth');
// const client =require('twilio')(env.accountSid,env.authToken);
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const moment = require('moment');

const {
    hashPassword,
    comparePassword,
    isValidEmail,
    validatePassword,
    isEmpty,
    generateUserToken,
    empty,
} = require('./app/helpers/validations');


const {
    errorMessage, successMessage, status,
} = require('./app/helpers/status');
const { port, accountSid, authToken } = require("./env");
const { response, query } = require("express");

// /**
//    * Create A User
//    * @param {object} req
//    * @param {object} res
//    * @returns {object} reflection object
//    */
//  app.post('/auth/signup', async (req,res) => {
//     const {
//         name, email, phone_no, password
//     } = req.body;

//     const created_on = moment(new Date());

//     if (isEmpty(email) || isEmpty(name) || isEmpty(phone_no) || isEmpty(password)) {
//         errorMessage.error = 'Email, Phone_no, Password, Name field cannot be empty';
//         return res.status(status.bad).send(errorMessage);
//     }

//     if (!isValidEmail(email)) {
//         errorMessage.error = 'Please enter a valid Email';
//         return res.status(status.bad).send(errorMessage);
//     }

//     if (!validatePassword(password)) {
//         errorMessage.error = 'Password must be more than five(5) characters';
//         return res.status(status.bad).send(errorMessage);
//     }

//     const hashedPassword = hashPassword(password);
//     const createUserQuery = `INSERT INTO
//     users(email, name, phone_no, password, created_on)
//     VALUES($1, $2, $3, $4, $5)
//     returning *`;

//     const values = [
//         email,
//         name,
//         phone_no,
//         hashedPassword,
//         created_on,
//       ];

//     try{
//         const { rows } = await pool.query(createUserQuery,values);
//         const dbResponse = rows[0];
//         delete dbResponse.password;
//         const token = generateUserToken(dbResponse.email,dbResponse.phone_no, dbResponse.id, dbResponse.is_admin, dbResponse.name);
//         successMessage.data = dbResponse;
//         successMessage.data.token = token;
//         return res.status(status.created).send(successMessage);
//     }  catch (error) {
//         if (error.routine === '_bt_check_unique') {
//           errorMessage.error = 'User with that EMAIL or Phone_no already exist';
//           return res.status(status.conflict).send(errorMessage);
//         }
//         errorMessage.error = 'Operation was not successful';
//         return res.status(status.error).send(errorMessage);
//     }
// });



// /**
//    * Signin
//    * @param {object} req
//    * @param {object} res
//    * @returns {object} user object
//    */
// app.post('/auth/signin/password', async (req,res) => {
//      const{ phone_no,password }= req.body;
//      if (isEmpty(phone_no) || isEmpty(password)) {
//         errorMessage.error = 'Phone_no or Password detail is missing';
//         return res.status(status.bad).send(errorMessage);
//       }
//      if (!validatePassword(password)) {
//         errorMessage.error = 'Please enter a valid Password';
//         return res.status(status.bad).send(errorMessage);
//       }

//       const signinUserQuery = 'SELECT * FROM users WHERE phone_no = $1';
//       try{
//           const { rows }= await pool.query(signinUserQuery,[phone_no]);
//           const dbResponse = rows[0];
//           if(!dbResponse){
//             errorMessage.error = 'User with this phone_no does not exist';
//             return res.status(status.notfound).send(errorMessage);
//           }

//           if (!comparePassword(dbResponse.password, password)) {
//             errorMessage.error = 'The password you provided is incorrect';
//             return res.status(status.bad).send(errorMessage);
//           }

//           const token = generateUserToken(dbResponse.email,dbResponse.phone_no,dbResponse.id, dbResponse.is_admin, dbResponse.name);
//           delete dbResponse.password;
//           successMessage.data =dbResponse;
//           successMessage.data.token= token;
//           return res.status(status.success).send(successMessage);
//       } catch(error){
//         errorMessage.error = 'Operation was not successful';
//         return res.status(status.error).send(errorMessage);
//       }
function getlength(number) {
    return number.toString().length;
}

// });
//SIGN IN API

app.post('/auth/signin', async (req, res) => {
    const { phone_no } = req.body;
    //phone no validations
    if (getlength(phone_no) < 10 || getlength(phone_no) > 10 || !phone_no) {
        errorMessage.error = 'Phone No Should be of 10 Digits';
        return res.status(status.bad).send(errorMessage);
    }
    //  if(!(typeof(phone_no)=="number")){
    //     errorMessage.error = 'Please Enter a Valid Phone No.'; 
    //     return res.status(status.bad).send(errorMessage);
    //  }
    const successMessage = { status: 'success' };
    const signinUserQuery = 'SELECT * FROM users WHERE phone_no = $1';
    const newuserquery = 'INSERT INTO users(phone_no) VALUES ($1) RETURNING *';
    try {
        const { rows } = await pool.query(signinUserQuery, [phone_no]);
        const dbResponse = rows[0];
        if (!dbResponse) {
            const results = await pool.query(newuserquery, [phone_no]);
            // const token = generateUserToken(results.rows[0].phone_no,results.rows[0].id);
            // successMessage.token=token;
            successMessage.newuser = 1;
        }
        else {
            // const token = generateUserToken(dbResponse.phone_no,dbResponse.id);
            // successMessage.token=token;
            successMessage.newuser = 0;
        }
        const password = "1234";//default password
        const hashedPassword = hashPassword(password);
        const otpupdate = await pool.query('UPDATE users SET password=$1 WHERE phone_no=$2 RETURNING *', [hashedPassword, phone_no]);
        successMessage.message = "Otp Generated";

        if (successMessage.newuser == 0) { return res.status(status.success).send(successMessage); }
        else {
            return res.status(status.created).send(successMessage);
        }

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }

})

/*
     req ====> OTP,newuser,phone_no
     res ====> token, homescreen
*/
//OTP VERIFICATION API
app.post("/auth/signin/otp", async (req, res) => {
    const { otp, phone_no } = req.body;
    const successMessage = { status: 'success' };
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE phone_no = $1', [phone_no]);
        const dbResponse = rows[0];
        if (!otp) {
            errorMessage.error = 'Enter a Valid OTP';
            return res.status(status.bad).send(errorMessage);
        }
        if (!dbResponse) {
            errorMessage.error = 'Phone_no Does not Exists';
            return res.status(status.bad).send(errorMessage);
        }
        if (!comparePassword(dbResponse.password, otp.toString())) {
            errorMessage.error = 'OTP is incorrect';
            return res.status(status.bad).send(errorMessage);
        }

        delete dbResponse.password;
        successMessage.message = "Authentication Successful";
        const token = generateUserToken(dbResponse.phone_no, dbResponse.id);
        successMessage.token = token
        const db = await pool.query('SELECT * FROM student WHERE phone_no = $1', [phone_no]);
        if (!db.rows[0]) {
            pool.query('INSERT INTO student (phone_no) VALUES ($1)', [dbResponse.phone_no]);
            successMessage.message2 = "User Added to Database";
        }
        // const studyarea = await pool.query('SELECT (field,standard,board) FROM student WHERE phone_no = $1', [phone_no]);
        // if (studyarea.rows[0].row === '(,,)') {
        //     successMessage.studyarea = 0;
        //     //if study area 0 call study area get api to get apis
        // }
        // else {
        //     successMessage.studyarea = 1;
        //     successMessage.Fields = studyarea.rows[0].row;
        // }
        // new user if 1 ---- study area  else calander details,trending,subjects (default),default study area
        // if (newuser === 1) {
        //     //Call GEt Study Area and post data into it
        // }
        // else {
        //     successMessage.trending = ["trending pages"];
        //     successMessage.subjects = ["Maths", "Science", "English", "Hindi", "Social Studies"];
        // }

        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }
})

//HOME SCREEN API 
/* 
   req=>>JWT TOKEN
   res=>> STUDYAREA,TRENDING, SUBJECTS, TIMETABLE of 7 DAYS
*/

app.get("/homescreen", auth, async (req, res) => {
    const { phone_no } = req.user;
    const successMessage = { status: 'success' };
    try {

        const studyarea = await pool.query('SELECT (field,standard,board) FROM student WHERE phone_no = $1', [phone_no]);
        let str = studyarea.rows[0].row;
        str = str.slice(1);
        str = str.slice(0, str.length - 1);
        const study = str.split(",");
        if (studyarea.rows[0].row === '(,,)') {
            successMessage.studyarea = { selected: false };
            //if study area 0 call study area get api to get apis
        }
        else {
            successMessage.studyarea = { selected: true };
            successMessage.studyarea.field = study[0];
            successMessage.studyarea.board = study[1];
            successMessage.studyarea.standard = study[2];

        }
        successMessage.trending = ["MATHS", "SCIENCE"];
        successMessage.subjects = ["Maths", "Science", "English", "Hindi", "Social Studies"];

        const db = await pool.query('SELECT courses FROM student WHERE phone_no=$1', [phone_no]);
        if (!(db.rows[0].courses)) {
            successMessage.calender = [];
        }
        else {
            const tcourse = db.rows[0].courses;
            const calender = [];
            for (let i = 0; i < tcourse.length; i++) {
                const course_id = tcourse[i];
                const cala = await pool.query("SELECT * FROM courses WHERE ((start_date <= NOW()::date) AND (end_date >= NOW()::date )) AND (course_id =$1);", [course_id]);
                if (cala.rows.length != 0) {
                    date = cala.rows[0].start_date;
                    // console.log("Date: " + date.getDate() +
                    //     "/" + (date.getMonth() + 1) +
                    //     "/" + date.getFullYear() +
                    //     " " + date.getHours() +
                    //     ":" + date.getMinutes() +
                    //     ":" + date.getSeconds());
                    cala.rows[0].start_date = (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
                    date = cala.rows[0].end_date;
                    cala.rows[0].end_date = (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
                }
                if (cala.rows.length != 0) {
                    delete cala.rows[0].course_id;
                    delete cala.rows[0].rating_stars;
                    delete cala.rows[0].class_;
                    delete cala.rows[0].location;
                    delete cala.rows[0].board;
                    delete cala.rows[0].description;
                    delete cala.rows[0].teacher_id;
                    delete cala.rows[0].fees;

                    console.log(cala.rows[0])
                    calender.push(cala.rows[0]);
                }
                // if(cala.rows[0])
                // {
                //     cala.rows[0].title="xyz";
                //     Calander.data.push(cala.rows[0]);
                // }
            }
            successMessage.calender = calender;
        }
        return res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
        return res.status(status.error).send(errorMessage);
    }
})




//COUNTRY CODE API
app.get("/countrycode", async (req, res) => {
    try {
        const countrycode = require("./app/countrycode/CountryCodes.json");
        return res.status(status.success).send(countrycode);
    } catch (error) {
        return res.status(status.error).send(error);
    }
})

//GET ALL STUDY AREA API 
app.get("/getall/studyarea", auth, async (req, res) => {
    try {
        const studyarea = require("./app/studyarea/studyareas.json");
        return res.status(status.success).send(studyarea);
    } catch (error) {
        return res.status(status.error).send(error);
    }
})

/*
   Choose Study Area  
    @param {object} req
    @param {object} res
    @returns {object} 
 */

app.post('/studyarea', auth, async (req, res) => {
    const { field, standard, board } = req.body;
    const { phone_no } = req.user;
    const studyareaquery = 'UPDATE student SET field=$1,standard=$2,board=$3 WHERE phone_no=$4 returning *';
    const values = [field, standard, board, phone_no];

    try {
        const { rows } = await pool.query(studyareaquery, values);
        const dbResponse = rows[0];
        successMessage.data = dbResponse;
        return res.status(status.created).send(successMessage);

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.error).send(errorMessage);
    }

});



//-------------------------------get all students

app.get('/students', auth, async (req, res) => {
    pool.query("SELECT * FROM student", (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})



//--------------------------------create a student

app.post("/student", auth, async (req, res) => {

    const { name, phone_no, email } = req.user;

    pool.query('INSERT INTO student (student_name,phone_no,email) VALUES ($1, $2, $3)', [name, phone_no, email], (error) => {
        if (error) {
            throw error
        }
        res.status(201).json({ status: 'success', message: 'Student Details Added' })
    })
})



/*   
   Get Courses for Student
*/

app.get("/course", auth, async (req, res) => {
    pool.query("SELECT * FROM courses", (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
})

/*   
   Post Courses in Student
*/

app.post("/bookcourse", auth, async (req, res) => {
    let { courses } = req.body;
    const { phone_no } = req.user;
    resp=await pool.query("SELECT courses FROM student WHERE phone_no=$1",[phone_no]);
    course=resp.rows[0].courses;
    courses=courses.filter(item=> !course.includes(item));
    pool.query('UPDATE student SET courses=array_cat(courses, $1)WHERE phone_no=$2 returning *', [courses, phone_no], (error, results) => {
        if (error) {
            throw error
        }
        successMessage.data = results.rows;
        res.status(status.created).send(successMessage)
    })

})


//post in course table
app.post("/course", async (req, res) => {

    const { time_start, time_end, start_date, end_date, teacher, fees, rating_stars, subjects, class_, board, location, description } = req.body

    pool.query('INSERT INTO courses (time_start,time_end,start_date,end_date,teacher,fees,rating_stars,subjects,class_,board,location,description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [time_start, time_end, start_date, end_date, teacher, fees, rating_stars, subjects, class_, board, location, description], (error) => {
        if (error) {
            throw error
        }
        res.status(status.created).json({ status: 'success', message: 'Course Details Added' })
    })
})

//GET Filter APIS
app.get("/filters", auth, async (req, res) => {
    try {
        const filters = require("./app/filters/filter.json");
        return res.status(status.success).send(filters);
    } catch (error) {
        return res.status(status.error).send(error);
    }
})

//Search API with filters
app.get("/search", auth, async (req, res) => {
    const { searchSubject, filter } = req.body;
    try {

        if (searchSubject == "") {
            dbresponse = await pool.query("SELECT * FROM public.courses");
        }
        else {
            if (filter.selected == false) {
                dbresponse = await pool.query("SELECT * FROM public.courses WHERE array_to_string(subjects,',') ILIKE $1", [`%${searchSubject}%`]);
            }
            // else if((isEmpty(filter.location) == false) && (isEmpty(filter.standard) == false) && (isEmpty(filter.board) == false)) {
            //     dbresponse = await pool.query("SELECT * FROM public.courses WHERE (array_to_string(subjects,',') ILIKE $1) AND ((location ILIKE $2) AND (array_to_string(class_,',') ILIKE $3) AND (array_to_string(board,',') ILIKE $4))", [`%${searchSubject}%`, `%${filter.location}%`, `${filter.standard}`, `%${filter.board}%`]);
            // }
            // else
            // {
            //     dbresponse.rows=[]
            // }
            else{
                dbquery=`SELECT * FROM public.courses WHERE ((array_to_string(subjects,',') ILIKE '`+`%${searchSubject}%`;
                keys=Object.keys(filter);
                keys.shift();
                for(let i=0;i<keys.length;i++)
                {
                      if(keys[i]=="location"){
                          dbquery=dbquery+`') AND (location ILIKE '`+ `%${filter.location}%`;
                      }
                      else if(keys[i]=="standard"){
                          dbquery=dbquery+`') AND (array_to_string(class_,',') ILIKE '`+ `${filter.standard}`;
                      }
                      else if(keys[i]=="board"){
                        dbquery=dbquery+`') AND (array_to_string(board,',') ILIKE '`+ `${filter.board}`;
                      }

                }
                if(keys.length>0)
                {
                    dbquery=dbquery+`'))`;
                }
                dbresponse= await pool.query(dbquery);
            }
        }
        // if (dbresponse.rows.length != 0) {
        //     delete dbresponse.rows[0].time_start;
        //     delete dbresponse.rows[0].time_end;
        //     delete dbresponse.rows[0].start_date;
        //     delete dbresponse.rows[0].end_date;
        //     delete dbresponse.rows[0].teacher_id;
        // }
        res.status(status.success).send(dbresponse.rows)
    } catch (error) {
        console.log(error);
        res.status(status.error).send(error)
    }
})


///Profile Api 

app.get("/profile", auth, async (req, res) => {
    const { phone_no } = req.user;
    const successMessage = { status: 'success' };
    try {
        db = await pool.query("SELECT * FROM student WHERE phone_no=$1", [phone_no]);
        if (db.rows.length != 0) {
            tcourses = db.rows[0].courses;
            delete db.rows[0].student_id;
            delete db.rows[0].field;
            if (tcourses) {
                for (let i = 0; i < tcourses.length; i++) {
                    const course_id = tcourses[i];
                    const subs = await pool.query("SELECT subjects FROM courses WHERE (course_id =$1);", [course_id]);
                    if (subs.rows[0].length != 0) {
                        successMessage.subjects = subs.rows[0].subjects;
                    }
                }
            }
            else {
                successMessage.subjects = [];
            }
            successMessage.name = db.rows[0].student_name;
            successMessage.phoneNo = db.rows[0].phone_no;
            successMessage.email = db.rows[0].email;
            successMessage.standard = db.rows[0].standard;
            successMessage.board = db.rows[0].board;

        }
        res.status(status.success).send(successMessage)
    } catch (error) {
        console.log(error)
        return res.status(status.error).send(errorMessage);
    }

})

//UPDATE STUDENT DETAILS
app.put("/profile", auth, async (req, res) => {
    const { phone_no } = req.user;
    const { name, email, standard, board } = req.body;
    pool.query('UPDATE student SET student_name=$1,email=$2,standard=$3,board=$4 WHERE phone_no=$5 returning *', [name, email, standard, board, phone_no], (error, results) => {
        if (error) {
            throw error
        }
        successMessage.data = results.rows;
        res.status(status.created).send(successMessage)
    })
})



//SERVER FOR NODE JS 

app.listen(env.port).on('listening', () => {
    console.log(`🚀 are live on ${env.port}`);
});



/// change subjects in course table