import pool from "../utils/db.js";

async function insertStudent(req, res) {
  const students = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "No valid student data provided" });
  }

  try {
    let values = ``;

    students.map((student) => {
      values += `("${student.student_id}", "${student.name}"),`;
    });

    values = values.slice(0, -1) + ";";
    const query = `
      INSERT INTO studentdata (student_id, name)
      VALUES ${values}
    `;

    const conn = await pool.getConnection();
    console.log(query);
    await conn.query(query);
    conn.release();

    res.status(201).json({
      message: "Student data inserted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database insertion failed.",
      error: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(`SELECT * FROM studentdata`);
    res.json(result);
    conn.release();
  } catch (err) {
    res.status(500).send(err);
  }
}

async function deleteOne(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing id parameter" });
  }

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "DELETE FROM studentdata WHERE student_id = ?",
      [id]
    );

    // ตรวจสอบว่าไม่มีการลบข้อมูล
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
    conn.release();
  } catch (err) {
    console.error("Error deleting student:", err);
    res
      .status(500)
      .json({ message: "Error deleting student", error: err.message });
  }
}

async function saveScore(req, res) {
  const { assignment_id, scores } = req.body;

  console.log("ได้รับข้อมูลคะแนนจาก frontend:", {
    assignment_id,
    scoresCount: scores?.length,
  });

  // ตรวจสอบข้อมูลที่ส่งมา
  if (
    !assignment_id ||
    !scores ||
    !Array.isArray(scores) ||
    scores.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "ข้อมูลไม่ถูกต้อง กรุณาระบุ assignment_id และข้อมูลคะแนน",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // เริ่ม transaction
    await conn.beginTransaction();

    // ตรวจสอบว่า assignment_id มีอยู่จริง
    const assignmentCheck = await conn.query(
      "SELECT assignment_id FROM assignments WHERE assignment_id = ?",
      [assignment_id]
    );

    if (!assignmentCheck || assignmentCheck.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล Assignment ที่ระบุ",
      });
    }

    // วนลูปบันทึกคะแนนแต่ละรายการ
    let successCount = 0;
    let errorCount = 0;

    for (const scoreItem of scores) {
      const { student_id, assignment_clo_id, score } = scoreItem;

      // ตรวจสอบว่ามีข้อมูลคะแนนนี้อยู่แล้วหรือไม่
      const existingRecord = await conn.query(
        `SELECT id FROM student_assignment_scores
                 WHERE student_id = ? AND assignment_id = ? AND assignment_clo_id = ?`,
        [student_id, assignment_id, assignment_clo_id]
      );

      try {
        if (existingRecord && existingRecord.length > 0) {
          // ถ้ามีข้อมูลอยู่แล้ว ให้อัพเดทคะแนน
          await conn.query(
            `UPDATE student_assignment_scores
                         SET score = ?, updated_at = NOW()
                         WHERE id = ?`,
            [score, existingRecord[0].id]
          );
        } else {
          // ถ้ายังไม่มี ให้เพิ่มข้อมูลใหม่
          await conn.query(
            `INSERT INTO student_assignment_scores
                         (student_id, assignment_id, assignment_clo_id, score, created_at)
                         VALUES (?, ?, ?, ?, NOW())`,
            [student_id, assignment_id, assignment_clo_id, score]
          );
        }
        successCount++;
      } catch (error) {
        console.error(
          `Error saving score for student ${student_id}, CLO ${assignment_clo_id}:`,
          error
        );
        errorCount++;
      }
    }

    // Commit transaction
    await conn.commit();

    console.log(
      `บันทึกคะแนนสำเร็จ ${successCount} รายการ, ผิดพลาด ${errorCount} รายการ`
    );

    return res.json({
      success: true,
      message: `บันทึกคะแนนสำเร็จ ${successCount} รายการ${errorCount > 0 ? `, ผิดพลาด ${errorCount} รายการ` : ""}`,
      successCount,
      errorCount,
    });
  } catch (error) {
    console.error("Error saving student scores:", error);

    // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
    if (conn) {
      await conn.rollback();
    }

    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกคะแนน",
      error: error.message,
    });
  } finally {
    if (conn) conn.release();
  }
}

async function getStudentsByProgram(req, res) {
  try {
    const { program_id, year } = req.query;
    
    // ตรวจสอบว่ามีการส่งค่าที่จำเป็นมาหรือไม่
    if (!program_id || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const conn = await pool.getConnection();
    
    // ดึงข้อมูลนักศึกษาจากฐานข้อมูล
    const query = `
      SELECT id, student_id, first_name, last_name, program_id, year, university_id, faculty_id
      FROM students 
      WHERE program_id = ? AND year = ?
      ORDER BY student_id ASC
    `;
    
    const result = await conn.query(query, [program_id, year]);
    res.json(result);
    conn.release();
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// 2. เพิ่มข้อมูลนักศึกษาใหม่
async function addStudent(req, res) {
  try {
    const { student_id, first_name, last_name, program_id, year, university_id, faculty_id } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!student_id || !first_name || !last_name || !program_id || !year || !university_id || !faculty_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    
    // ตรวจสอบว่ามีนักศึกษารหัสนี้ในโปรแกรมและปีการศึกษานี้หรือไม่
    const checkQuery = `
      SELECT id FROM students 
      WHERE student_id = ? AND program_id = ? AND year = ?
    `;
    const checkResult = await conn.query(checkQuery, [student_id, program_id, year]);
    
    if (checkResult && checkResult.length > 0) {
      conn.release();
      return res.status(409).json({ error: 'Student ID already exists in this program and year' });
    }
    
    // เพิ่มข้อมูลนักศึกษาลงในฐานข้อมูล
    const query = `
      INSERT INTO students (student_id, first_name, last_name, program_id, year, university_id, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [student_id, first_name, last_name, program_id, year, university_id, faculty_id];
    const result = await conn.query(query, values);
    
    // ดึงข้อมูลนักศึกษาที่เพิ่งเพิ่ม
    const insertedId = result.insertId;
    const insertedStudent = await conn.query('SELECT * FROM students WHERE id = ?', [insertedId]);
    
    conn.release();
    res.status(201).json(insertedStudent[0]);
  } catch (error) {
    console.error('Error adding student:', error);
    
    // ตรวจสอบการซ้ำกันของข้อมูล (Duplicate key)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// 3. อัปเดตข้อมูลนักศึกษา
async function updateStudent(req, res) {
  try {
    const studentId = req.params.id;
    const { student_id, first_name, last_name, program_id, year, university_id, faculty_id } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!student_id || !first_name || !last_name || !program_id || !year || !university_id || !faculty_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    
    // ตรวจสอบว่ามีนักศึกษาคนนี้หรือไม่
    const checkQuery = 'SELECT id FROM students WHERE id = ?';
    const checkResult = await conn.query(checkQuery, [studentId]);
    
    if (!checkResult || checkResult.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // อัปเดตข้อมูลนักศึกษา
    const query = `
      UPDATE students
      SET student_id = ?, first_name = ?, last_name = ?, 
          program_id = ?, year = ?, university_id = ?, faculty_id = ?
      WHERE id = ?
    `;
    
    const values = [student_id, first_name, last_name, program_id, year, university_id, faculty_id, studentId];
    await conn.query(query, values);
    
    // ดึงข้อมูลนักศึกษาที่อัปเดตแล้ว
    const updatedStudent = await conn.query('SELECT * FROM students WHERE id = ?', [studentId]);
    
    conn.release();
    res.json(updatedStudent[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    
    // ตรวจสอบการซ้ำกันของข้อมูล (Duplicate key)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// 4. ลบข้อมูลนักศึกษา
async function deleteStudent(req, res) {
  try {
    const studentId = req.params.id;
    
    const conn = await pool.getConnection();
    
    // ตรวจสอบว่ามีนักศึกษาคนนี้หรือไม่
    const checkQuery = 'SELECT id FROM students WHERE id = ?';
    const checkResult = await conn.query(checkQuery, [studentId]);
    
    if (!checkResult || checkResult.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // ลบข้อมูลนักศึกษา
    const query = 'DELETE FROM students WHERE id = ?';
    await conn.query(query, [studentId]);
    
    conn.release();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// 5. นำเข้าข้อมูลนักศึกษาจาก Excel
async function importStudentsFromExcel(req, res) {
  try {
    const studentsData = req.body;
    
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const conn = await pool.getConnection();
    
    // เริ่ม transaction
    await conn.beginTransaction();
    
    try {
      let successCount = 0;
      let errorCount = 0;
      const results = [];
      
      for (const student of studentsData) {
        try {
          // ตรวจสอบข้อมูลที่จำเป็น
          const { student_id, first_name, last_name, program_id, year, university_id, faculty_id } = student;
          
          if (!student_id || !first_name || !last_name || !program_id || !year || !university_id || !faculty_id) {
            errorCount++;
            continue;
          }
          
          // ตรวจสอบว่ามีนักศึกษารหัสนี้ในโปรแกรมและปีการศึกษานี้หรือไม่
          const checkQuery = `
            SELECT id FROM students 
            WHERE student_id = ? AND program_id = ? AND year = ?
          `;
          const checkResult = await conn.query(checkQuery, [student_id, program_id, year]);
          
          let studentId;
          
          if (checkResult && checkResult.length > 0) {
            // อัปเดตข้อมูลที่มีอยู่แล้ว
            const updateQuery = `
              UPDATE students
              SET first_name = ?, last_name = ?, university_id = ?, faculty_id = ?
              WHERE id = ?
            `;
            await conn.query(updateQuery, [
              first_name, 
              last_name, 
              university_id, 
              faculty_id, 
              checkResult[0].id
            ]);
            studentId = checkResult[0].id;
          } else {
            // เพิ่มข้อมูลใหม่
            const insertQuery = `
              INSERT INTO students (student_id, first_name, last_name, program_id, year, university_id, faculty_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const insertResult = await conn.query(insertQuery, [
              student_id, 
              first_name, 
              last_name, 
              program_id, 
              year, 
              university_id, 
              faculty_id
            ]);
            studentId = insertResult.insertId;
          }
          
          // ดึงข้อมูลนักศึกษาที่เพิ่ม/อัปเดต
          const studentData = await conn.query('SELECT * FROM students WHERE id = ?', [studentId]);
          results.push(studentData[0]);
          successCount++;
        } catch (error) {
          console.error('Error processing student:', error);
          errorCount++;
        }
      }
      
      // Commit transaction
      await conn.commit();
      
      res.status(201).json({
        message: `Successfully processed ${successCount} students, errors: ${errorCount}`,
        successCount,
        errorCount,
        data: results
      });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

export { 
  insertStudent, 
  getAll, 
  deleteOne, 
  saveScore,
  getStudentsByProgram,
  addStudent,
  updateStudent,
  deleteStudent,
  importStudentsFromExcel
};