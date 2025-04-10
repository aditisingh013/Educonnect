const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});
const promiseConnection = connection.promise();
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
        return;
    }
    console.log('DB connected ✅');
});

let instance = null; // ✅ Define the variable outside the class

class dbserver {
    static getDbServiceInstance() {
        if (!instance) {
            instance = new dbserver(); // ✅ Assign the instance if not already done
        }
        return instance;
    }

    // INSIDE dbservice class
async getAllData() {
    try {
        return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            td.tutor_id,
            u.profile,
            u.first_name,
            u.last_name,
            td.education,
            COALESCE(AVG(r.rating), 0) AS rating,
            GROUP_CONCAT(DISTINCT CONCAT(s.sub_name, ' - ₹', st.hourly_rate) ORDER BY s.sub_name SEPARATOR ', ') AS subjects_with_rates
        FROM tutor_detail td
        JOIN users u ON td.user_id = u.user_id
        JOIN subject_taught st ON td.tutor_id = st.tutor_id
        JOIN subjects s ON st.sub_id = s.sub_id
        LEFT JOIN review r ON td.tutor_id = r.tutor_id
        GROUP BY td.tutor_id;
        `;
        connection.query(query, (err, results) => {
          if (err) {
            reject(new Error(err.message));
          }
          resolve(results);
        });
      });
  
      return response;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  async searchByName(name) {
    try {
        const search = `%${name}%`;
        const response = await new Promise((resolve, reject) => {
            const query = `
                SELECT 
                u.first_name,
                u.last_name,
                u.profile,
                td.education,
                COALESCE(AVG(r.rating), 0) AS rating,
                GROUP_CONCAT(DISTINCT CONCAT(s.sub_name, ' - ₹', st.hourly_rate) ORDER BY s.sub_name SEPARATOR ', ') AS subjects_with_rates,
                MAX(st.hourly_rate) AS rate
            FROM tutor_detail td
            JOIN users u ON td.user_id = u.user_id
            JOIN subject_taught st ON td.tutor_id = st.tutor_id
            JOIN subjects s ON st.sub_id = s.sub_id
            LEFT JOIN review r ON td.tutor_id = r.tutor_id
            WHERE u.first_name LIKE ?
                OR u.last_name LIKE ?
                OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
            GROUP BY td.tutor_id;

            `;

            connection.query(query, [search, search, search], (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            });
        });

        return response;
    } catch (error) {
        console.error("Search Error:", error);
        return [];
    }
}


async searchByInstitute(name) {
    try {
        const response = await new Promise((resolve, reject) => {
            const search = `%${name}%`; 

            const query = `
                    SELECT 
                    u.first_name,
                    u.last_name,
                    u.profile,
                    td.education,
                    td.school,
                    td.college,
                    td.job_place,
                    COALESCE(AVG(r.rating), 0) AS rating,
                    GROUP_CONCAT(DISTINCT CONCAT(s.sub_name, ' - ₹', st.hourly_rate) ORDER BY s.sub_name SEPARATOR ', ') AS subjects_with_rates,
                    MAX(st.hourly_rate) AS rate
                FROM tutor_detail td
                JOIN users u ON td.user_id = u.user_id
                JOIN subject_taught st ON td.tutor_id = st.tutor_id
                JOIN subjects s ON st.sub_id = s.sub_id
                LEFT JOIN review r ON td.tutor_id = r.tutor_id
                WHERE td.school LIKE ? 
                    OR td.college LIKE ? 
                    OR td.job_place LIKE ?
                GROUP BY td.tutor_id;
                                
            `;

            connection.query(query, [search, search, search], (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            });
        });

        return response;
    } catch (error) {
        console.log(error);
    }
}

async filterTutors(filters) {
    try {
        const { minPrice, maxPrice, education, experience, rating, subject } = filters;

        const whereConditions = [];
        const havingConditions = [];
        const queryParams = [];
        
        if (minPrice) {
            whereConditions.push("st.hourly_rate >= ?");
            queryParams.push(minPrice);
        }
        if (maxPrice) {
            whereConditions.push("st.hourly_rate <= ?");
            queryParams.push(maxPrice);
        }
        if (education && education.length > 0) {
            whereConditions.push(`td.education IN (${education.map(() => '?').join(',')})`);
            queryParams.push(...education);
        }
        if (experience && experience.length > 0) {
            whereConditions.push(`st.skill_level IN (${experience.map(() => '?').join(',')})`);
            queryParams.push(...experience);
        }
        if (subject) {
            whereConditions.push("s.sub_name = ?");
            queryParams.push(subject);
        }
        if (rating) {
            havingConditions.push("AVG(r.rating) >= ?");
            queryParams.push(rating);
        }
        
        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : "";
        const havingClause = havingConditions.length ? `HAVING ${havingConditions.join(" AND ")}` : "";
        
        const query = `
        SELECT 
            u.first_name,
            u.last_name,
            u.profile,
            td.education,
            GROUP_CONCAT(DISTINCT st.skill_level ORDER BY st.skill_level SEPARATOR ', ') AS skills,
            COALESCE(AVG(r.rating), 0) AS rating,
            GROUP_CONCAT(DISTINCT CONCAT(s.sub_name, ' - ₹', st.hourly_rate) ORDER BY s.sub_name SEPARATOR ', ') AS subjects_with_rates,
            MAX(st.hourly_rate) AS rate
        FROM tutor_detail td
        JOIN users u ON td.user_id = u.user_id
        JOIN subject_taught st ON td.tutor_id = st.tutor_id
        JOIN subjects s ON st.sub_id = s.sub_id
        LEFT JOIN review r ON td.tutor_id = r.tutor_id
        ${whereClause}
        GROUP BY td.tutor_id
        ${havingClause};

        `;
        

        const results = await new Promise((resolve, reject) => {
            connection.query(query, queryParams, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            });
        });

        return results;

    } catch (err) {
        console.error("Filter Error:", err);
        return [];
    }
}

async uploadDoc(file, user_id, subject_id) {
    try {
        const { originalname, filename } = file;
        const fileUrl = `/uploads/${filename}`;
        const query = `
            INSERT INTO document_upload (user_id, subject_id, file_name, file_url)
            VALUES (?, ?, ?, ?)
        `;
        const values = [user_id, subject_id, originalname, fileUrl];

        const [result] = await connection.promise().query(query, values);

        return result;
    } catch (err) {
        console.error("uploadDoc Error:", err);
        throw err;
    }
}

//get all docs
async getAllDocuments() {
    try {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            d.material_id AS doc_id,
            d.file_name,
            d.file_url,
            s.sub_name AS subject,
            d.uploaded_at
          FROM document_upload d
          JOIN subjects s ON d.subject_id = s.sub_id
          ORDER BY d.uploaded_at DESC
        `;
        
        connection.query(query, (err, results) => {
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error("Error in getAllDocuments:", error);
      return [];
    }
  }

getTutorById(tutor_id) {
    return new Promise((resolve, reject) => {
        const query = `
                    SELECT 
                    t.tutor_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.bio,
                    t.education,
                    t.school,
                    t.college,
                    t.job_place,
                    t.resume,
                    ROUND(AVG(r.rating), 1) AS rating,
                    GROUP_CONCAT(CONCAT(s.sub_name, ' (', st.skill_level, ') - ₹', st.hourly_rate) SEPARATOR ', ') AS subjects_with_rates
                FROM tutor_detail t
                JOIN users u ON t.user_id = u.user_id
                LEFT JOIN subject_taught st ON t.tutor_id = st.tutor_id
                LEFT JOIN subjects s ON st.sub_id = s.sub_id
                LEFT JOIN review r ON r.tutor_id = t.tutor_id
                WHERE t.tutor_id = ?
                GROUP BY t.tutor_id;

        `;

        connection.query(query, [tutor_id], (err, results) => {
            if (err) {
                console.error("Error in getTutorById:", err);
                reject(err);
            } else {
                resolve(results[0]); // Return a single object, not an array
            }
        });
    });
}
}
module.exports = { dbserver, connection };


