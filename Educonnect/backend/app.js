const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authController = require('./controller/auth');
const routes = require('./routes/auth');
const multer= require('multer');

//multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // typo fix: "estination" → "destination"
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const { verifyToken } = require('./middleware/auth');

const { dbserver, connection } = require('./dbserver');

// Serve static files (e.g., index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    next();  
  });
  

//routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Protected route
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

//read
app.get('/getAll', (req, res) => {
    const db = dbserver.getDbServiceInstance();
    db.getAllData()
        .then(data => {
            res.json({ data });
        })
        .catch(err => {
            console.error("Error in /getAll route:", err); 
            res.status(500).json({ error: "Internal Server Error" }); 
        });
});

//upload doc
app.get('/getAllDocuments', (req, res) => {
    const db = dbserver.getDbServiceInstance();
    db.getAllDocuments()
      .then(data => res.json({ data }))
      .catch(err => {
        console.error("Error in /getAllDocuments route:", err); 
        res.status(500).json({ error: "Internal Server Error" }); 
      });
  });
  

// Search by name
app.get('/search/name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const db = dbserver.getDbServiceInstance(); 
        const data = await db.searchByName(name);
        res.json({ data });
    } catch (err) {
        console.error("Error in /search/name route:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Search by institute
app.get('/search/institute/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const db = dbserver.getDbServiceInstance(); 
        const data = await db.searchByInstitute(name);
        res.json({ data });
    } catch (err) {
        console.error("Error in /search/institute route:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//get tutor_details
// Fetch details of a specific tutor by ID
app.get('/tutor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = dbserver.getDbServiceInstance();
        const data = await db.getTutorById(id);
        
        console.log("Tutor fetched:", data);
        if (!data) {
            return res.status(404).json({ error: "Tutor not found" });
        }

        res.json({ data: data }); // Wrap the data object
    } catch (err) {
        console.error("Error in /tutor/:id route:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//rest of the filter
app.post('/filter', async (req, res) => {
    try {
        const filters = req.body;
        const db = dbserver.getDbServiceInstance(); 
        const data = await db.filterTutors(filters);
        res.json({ data: data });
    } catch (err) {
        console.error("Error in /filter route:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//document upload

app.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const file = req.file;
        const user_id = req.user.user_id;
        const sub_name = req.body.subject_name;

        console.log("Uploaded file info:", file);
        console.log("User ID:", user_id);
        console.log("Subject name:", sub_name);

        const db = dbserver.getDbServiceInstance();

        const subjectQuery = 'SELECT sub_id FROM subjects WHERE sub_name = ?';
        const [rows] = await connection.promise().query(subjectQuery, [sub_name]);

        if (rows.length === 0) {
            console.log("Invalid subject name:", sub_name);
            return res.status(400).send('Invalid subject name.');
        }

        const subject_id = rows[0].sub_id;
        console.log("Resolved subject_id:", subject_id);

        await db.uploadDoc(file, user_id, subject_id);
        console.log("Document uploaded to database successfully");

        res.redirect('/docUpload.html');
    } catch (err) {
        console.error('File upload failed:', err);
        res.status(500).send("Failed to upload file.");
    }
});

app.listen(process.env.PORT, () => console.log("app is running"));

