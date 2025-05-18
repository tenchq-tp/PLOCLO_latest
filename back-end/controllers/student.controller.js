import pool from "../utils/db.js";

async function insertStudent(req, res) {
  const students = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "No valid student data provided" });
  }

  try {
    // Begin transaction to ensure data consistency
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Process each student
      for (const student of students) {
        // Insert into student table
        await conn.query(
          `INSERT INTO student (student_id, first_name, last_name) 
           VALUES (?, ?, ?)`,
          [student.student_id, student.name, student.name] // Using name for both first and last name
        );

        // Optionally, add program relationship if program_id is provided
        if (student.program_id) {
          await conn.query(
            `INSERT INTO student_program (student_id, program_id) 
             VALUES (?, ?)`,
            [student.student_id, student.program_id]
          );
        }
      }

      // Commit the transaction
      await conn.commit();
      conn.release();

      res.status(201).json({
        message: "Student data inserted successfully",
      });
    } catch (error) {
      // Rollback in case of error
      await conn.rollback();
      throw error;
    }
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
    // Get all students with their program information
    const result = await conn.query(`
      SELECT s.student_id, s.first_name, s.last_name, sp.program_id
      FROM student s
      LEFT JOIN student_program sp ON s.student_id = sp.student_id
    `);
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
    await conn.beginTransaction();
    
    try {
      // First delete from student_program
      await conn.query(
        "DELETE FROM student_program WHERE student_id = ?",
        [id]
      );
      
      // Then delete from student
      const result = await conn.query(
        "DELETE FROM student WHERE student_id = ?",
        [id]
      );

      // Check if any rows were affected
      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Student not found" });
      }

      await conn.commit();
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
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

  // Validate input data
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

    // Begin transaction
    await conn.beginTransaction();

    // Check if assignment_id exists
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

    // Process each score
    let successCount = 0;
    let errorCount = 0;

    for (const scoreItem of scores) {
      const { student_id, assignment_clo_id, score } = scoreItem;

      try {
        // Check if the student has an entry in assignment_student
        let assignmentStudentId;
        const assignmentStudentCheck = await conn.query(
          `SELECT id FROM assignment_student 
           WHERE student_id = ? AND assignment_id = ?`,
          [student_id, assignment_id]
        );

        if (assignmentStudentCheck && assignmentStudentCheck.length > 0) {
          assignmentStudentId = assignmentStudentCheck[0].id;
        } else {
          // Create a new entry in assignment_student
          const insertResult = await conn.query(
            `INSERT INTO assignment_student 
             (assignment_id, student_id, assigned_date, is_submitted) 
             VALUES (?, ?, NOW(), FALSE)`,
            [assignment_id, student_id]
          );
          assignmentStudentId = insertResult.insertId;
        }

        // Check if there's an existing grade
        const existingGrade = await conn.query(
          `SELECT id FROM assignment_grade 
           WHERE assignment_student_id = ?`,
          [assignmentStudentId]
        );

        if (existingGrade && existingGrade.length > 0) {
          // Update existing grade
          await conn.query(
            `UPDATE assignment_grade 
             SET score = ?, graded_at = NOW() 
             WHERE id = ?`,
            [score, existingGrade[0].id]
          );
        } else {
          // Insert new grade
          await conn.query(
            `INSERT INTO assignment_grade 
             (assignment_student_id, score, graded_at) 
             VALUES (?, ?, NOW())`,
            [assignmentStudentId, score]
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

    // Rollback transaction in case of error
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
    
    // Validate required parameters
    if (!program_id || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const conn = await pool.getConnection();
    
    // Get students from database with matching program_id
    const query = `
      SELECT s.student_id, s.first_name, s.last_name, sp.program_id, 
             p.year, u.university_id, f.faculty_id
      FROM student s
      JOIN student_program sp ON s.student_id = sp.student_id
      JOIN program p ON sp.program_id = p.program_id
      LEFT JOIN university_program up ON p.program_id = up.program_id
      LEFT JOIN university u ON up.university_id = u.university_id
      LEFT JOIN program_faculty pf ON p.program_id = pf.program_id
      LEFT JOIN faculty f ON pf.faculty_id = f.faculty_id
      WHERE sp.program_id = ? AND p.year = ?
      ORDER BY s.student_id ASC
    `;
    
    const result = await conn.query(query, [program_id, year]);
    res.json(result);
    conn.release();
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function addStudent(req, res) {
  try {
    const { student_id, first_name, last_name, program_id, year, university_id, faculty_id } = req.body;
    
    // Validate required fields
    if (!student_id || !first_name || !last_name || !program_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {
      // Check if student already exists with this ID
      const checkQuery = `
        SELECT student_id FROM student 
        WHERE student_id = ?
      `;
      const checkResult = await conn.query(checkQuery, [student_id]);
      
      if (checkResult && checkResult.length > 0) {
        await conn.rollback();
        return res.status(409).json({ error: 'Student ID already exists' });
      }
      
      // Insert student
      const insertStudentQuery = `
        INSERT INTO student (student_id, first_name, last_name)
        VALUES (?, ?, ?)
      `;
      
      await conn.query(insertStudentQuery, [student_id, first_name, last_name]);
      
      // Insert student program relation
      const insertStudentProgramQuery = `
        INSERT INTO student_program (student_id, program_id)
        VALUES (?, ?)
      `;
      
      await conn.query(insertStudentProgramQuery, [student_id, program_id]);
      
      // Get the inserted student with program details
      const insertedStudent = await conn.query(`
        SELECT s.student_id, s.first_name, s.last_name, sp.program_id, p.year
        FROM student s
        JOIN student_program sp ON s.student_id = sp.student_id
        JOIN program p ON sp.program_id = p.program_id
        WHERE s.student_id = ?
      `, [student_id]);
      
      await conn.commit();
      res.status(201).json(insertedStudent[0]);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error adding student:', error);
    
    // Check for duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function updateStudent(req, res) {
  try {
    const studentId = req.params.id;
    const { student_id, first_name, last_name, program_id, year } = req.body;
    
    // Validate required fields
    if (!student_id || !first_name || !last_name || !program_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {
      // Check if student exists
      const checkQuery = 'SELECT student_id FROM student WHERE student_id = ?';
      const checkResult = await conn.query(checkQuery, [studentId]);
      
      if (!checkResult || checkResult.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Student not found' });
      }
      
      // Update student data
      const updateStudentQuery = `
        UPDATE student
        SET student_id = ?, first_name = ?, last_name = ?
        WHERE student_id = ?
      `;
      
      await conn.query(updateStudentQuery, [student_id, first_name, last_name, studentId]);
      
      // Update student program relation if student_id has changed
      if (studentId !== student_id) {
        // Delete old relation
        await conn.query('DELETE FROM student_program WHERE student_id = ?', [studentId]);
        
        // Add new relation
        await conn.query(
          'INSERT INTO student_program (student_id, program_id) VALUES (?, ?)',
          [student_id, program_id]
        );
      } else {
        // Just update the program_id
        const checkProgramQuery = 'SELECT id FROM student_program WHERE student_id = ?';
        const checkProgramResult = await conn.query(checkProgramQuery, [studentId]);
        
        if (checkProgramResult && checkProgramResult.length > 0) {
          await conn.query(
            'UPDATE student_program SET program_id = ? WHERE student_id = ?',
            [program_id, studentId]
          );
        } else {
          await conn.query(
            'INSERT INTO student_program (student_id, program_id) VALUES (?, ?)',
            [studentId, program_id]
          );
        }
      }
      
      // Get updated student data
      const updatedStudent = await conn.query(`
        SELECT s.student_id, s.first_name, s.last_name, sp.program_id, p.year
        FROM student s
        LEFT JOIN student_program sp ON s.student_id = sp.student_id
        LEFT JOIN program p ON sp.program_id = p.program_id
        WHERE s.student_id = ?
      `, [student_id]);
      
      await conn.commit();
      res.json(updatedStudent[0]);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error updating student:', error);
    
    // Check for duplicate key error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function deleteStudent(req, res) {
  try {
    const studentId = req.params.id;
    
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {
      // Check if student exists
      const checkQuery = 'SELECT student_id FROM student WHERE student_id = ?';
      const checkResult = await conn.query(checkQuery, [studentId]);
      
      if (!checkResult || checkResult.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Student not found' });
      }
      
      // First delete student program relation
      await conn.query('DELETE FROM student_program WHERE student_id = ?', [studentId]);
      
      // Delete any assignment data
      const assignmentStudentIds = await conn.query(
        'SELECT id FROM assignment_student WHERE student_id = ?',
        [studentId]
      );
      
      if (assignmentStudentIds && assignmentStudentIds.length > 0) {
        for (const item of assignmentStudentIds) {
          await conn.query(
            'DELETE FROM assignment_grade WHERE assignment_student_id = ?',
            [item.id]
          );
        }
        
        await conn.query('DELETE FROM assignment_student WHERE student_id = ?', [studentId]);
      }
      
      // Finally delete the student
      await conn.query('DELETE FROM student WHERE student_id = ?', [studentId]);
      
      await conn.commit();
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function importStudentsFromExcel(req, res) {
  try {
    const studentsData = req.body;
    
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {
      let successCount = 0;
      let errorCount = 0;
      const results = [];
      
      for (const student of studentsData) {
        try {
          // Validate required fields
          const { student_id, first_name, last_name, program_id, year } = student;
          
          if (!student_id || !first_name || !last_name || !program_id) {
            errorCount++;
            continue;
          }
          
          // Check if student exists
          const checkQuery = 'SELECT student_id FROM student WHERE student_id = ?';
          const checkResult = await conn.query(checkQuery, [student_id]);
          
          if (checkResult && checkResult.length > 0) {
            // Update existing student
            await conn.query(
              'UPDATE student SET first_name = ?, last_name = ? WHERE student_id = ?',
              [first_name, last_name, student_id]
            );
            
            // Check if program relation exists
            const programCheckQuery = 'SELECT id FROM student_program WHERE student_id = ?';
            const programCheckResult = await conn.query(programCheckQuery, [student_id]);
            
            if (programCheckResult && programCheckResult.length > 0) {
              await conn.query(
                'UPDATE student_program SET program_id = ? WHERE student_id = ?',
                [program_id, student_id]
              );
            } else {
              await conn.query(
                'INSERT INTO student_program (student_id, program_id) VALUES (?, ?)',
                [student_id, program_id]
              );
            }
          } else {
            // Insert new student
            await conn.query(
              'INSERT INTO student (student_id, first_name, last_name) VALUES (?, ?, ?)',
              [student_id, first_name, last_name]
            );
            
            // Add program relation
            await conn.query(
              'INSERT INTO student_program (student_id, program_id) VALUES (?, ?)',
              [student_id, program_id]
            );
          }
          
          // Get inserted/updated student data
          const studentData = await conn.query(`
            SELECT s.student_id, s.first_name, s.last_name, sp.program_id, p.year
            FROM student s
            LEFT JOIN student_program sp ON s.student_id = sp.student_id
            LEFT JOIN program p ON sp.program_id = p.program_id
            WHERE s.student_id = ?
          `, [student_id]);
          
          results.push(studentData[0]);
          successCount++;
        } catch (error) {
          console.error('Error processing student:', error);
          errorCount++;
        }
      }
      
      await conn.commit();
      
      res.status(201).json({
        message: `Successfully processed ${successCount} students, errors: ${errorCount}`,
        successCount,
        errorCount,
        data: results
      });
    } catch (error) {
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
  importStudentsFromExcel,
};