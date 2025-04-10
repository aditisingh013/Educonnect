const { connection } = require('../dbserver');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET
// Token generator function
const generateToken = (user) => {
    return jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '5h' });
};

exports.signup = (req, res) => {
    const { fname, lname, email, password } = req.body;
    const isTutor = req.body['signup-tutor'];

    if (isTutor) {
        return res.redirect(`/tutor_detail.html?fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Server error');
        }

        const sql = 'INSERT INTO users (role, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)';
        const values = ['student', fname, lname, email, hashedPassword];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting student:', err);
                return res.status(500).send('Something went wrong while signing up');
            }

            console.log(`Student registered with ID ${result.insertId}`);

            const token = generateToken({ user_id: result.insertId, role: 'student' });
            res.cookie('jwt', token, { httpOnly: true });
            return res.redirect('/home.html');
        });
    });
};

exports.signin = (req, res) => {
    const { verify_email, verify_password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    
    connection.query(sql, [verify_email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(401).send("Invalid email or password.");
        }

        const user = results[0];

        bcrypt.compare(verify_password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Bcrypt error:', err);
                return res.status(500).send('Server error');
            }

            if (!isMatch) {
                return res.status(401).send("Invalid email or password.");
            }

            const token = generateToken({ user_id: user.user_id, role: user.role });
            res.cookie('jwt', token, { httpOnly: true });

            return res.redirect('/home.html');
        });
    });
};

//tutor signup
// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), 
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

const upload = multer({ storage });
exports.uploadMiddleware = upload.single('resume');

// Controller
exports.registerTutor = async (req, res) => {
    console.log('registerTutor called');
    console.log('Form Data:', req.body);
    try {
        const {
            fname, lname, email, password, bio,
            'highest-qualification': education,
            'school-name': school,
            'college-name': college,
            'workplace': workplace,
            subjects = [],
            rate = [],
            skill = [],
            language_medium,
            from_day, to_day, start_time, end_time
        } = req.body;

        const resumePath = req.file ? `/uploads/${req.file.filename}` : null;
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Insert into `users`
        const userSql = `
            INSERT INTO users (role, first_name, last_name, email, password, bio)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const userValues = ['tutor', fname, lname, email, hashedPassword, bio];

        connection.query(userSql, userValues, (err, userResult) => {
            if (err) {
                console.error('User insert error:', err);
                return res.status(500).send('Error creating user');
            }

            const user_id = userResult.insertId;

            // 2. Insert into `tutor_detail`
            const tutorSql = `
                INSERT INTO tutor_detail (user_id, education, school, college, job_place, resume)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const tutorValues = [user_id, education, school, college, workplace, resumePath];

            connection.query(tutorSql, tutorValues, (err, tutorResult) => {
                if (err) {
                    console.error('Tutor detail insert error:', err);
                    return res.status(500).send('Error inserting tutor detail');
                }

                const tutor_id = tutorResult.insertId;

                // 3. Insert subjects into `subject_taught`
                const subjArray = Array.isArray(subjects) ? subjects : [subjects];
                const rateArray = Array.isArray(rate) ? rate : [rate];
                const skillArray = Array.isArray(skill) ? skill : [skill];
                const langArray = Array.isArray(language_medium) ? language_medium : [language_medium];

                // First ensure subjects exist in `subjects` table and get their sub_id
                const getSubIds = subjArray.map(subj => {
                    return new Promise((resolve, reject) => {
                        const insertSub = `INSERT IGNORE INTO subjects (sub_name) VALUES (?)`;
                        connection.query(insertSub, [subj], (err) => {
                            if (err) return reject(err);
                            const getId = `SELECT sub_id FROM subjects WHERE sub_name = ?`;
                            connection.query(getId, [subj], (err, rows) => {
                                if (err) return reject(err);
                                resolve(rows[0].sub_id);
                            });
                        });
                    });
                });

                console.log({
                    subjArray,
                    langArray,
                    skillArray,
                    rateArray
                  });
                  

                Promise.all(getSubIds)
                    .then((subIds) => {
                        const subjectEntries = subIds.map((sub_id, i) => [
                            tutor_id,
                            sub_id,
                            langArray[i] || langArray[0],
                            skillArray[i] || skillArray[0],
                            rateArray[i] || 0
                        ]);

                        const subjSql = `
                            INSERT INTO subject_taught (tutor_id, sub_id, language_medium, skill_level, hourly_rate)
                            VALUES ?
                        `;
                        connection.query(subjSql, [subjectEntries], (err) => {
                            if (err) {
                                console.error('Subjects insert error:', err);
                                return res.status(500).send('Error inserting subjects');
                            }

                            // 4. Insert availability
                            const availSql = `
                                INSERT INTO availability_slots (tutor_id, from_day, to_day, start_time, end_time)
                                VALUES (?, ?, ?, ?, ?)
                            `;
                            const availValues = [tutor_id, from_day, to_day, start_time, end_time];

                            connection.query(availSql, availValues, (err) => {
                                if (err) {
                                    console.error('Availability insert error:', err);
                                    return res.status(500).send('Error inserting availability');
                                }

                                return res.redirect('/Loginpage.html?message=AccountCreated');
                            });
                        });
                    })
                    .catch(err => {
                        console.error('Subject ID resolution error:', err);
                        return res.status(500).send('Error resolving subject IDs');
                    });
            });
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).send('Server error');
    }
};




