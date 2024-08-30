import mysql from 'mysql2';

// Buat pool koneksi
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ems_new',
  connectionLimit: 10 // Atur jumlah maksimum koneksi di pool
});

// Buat fungsi queryAsync untuk menggunakan pool
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

export { pool, queryAsync };
