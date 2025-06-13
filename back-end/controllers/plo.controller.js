import pool from "../utils/db.js";

async function getManyByProgram(req, res) {
  const { program_id } = req.query;

  if (!program_id) {
    return res
      .status(400)
      .json({ success: false, message: "Program ID is required" });
  }

  try {
    const conn = await pool.getConnection();
    const plos = await conn.query(
      `
        SELECT p.PLO_id, p.PLO_name, p.PLO_engname,  p.PLO_code
        FROM plo p
        INNER JOIN program_plo pp ON p.PLO_id = pp.PLO_id
        WHERE pp.program_id = ?
        ORDER BY CAST(SUBSTRING(p.PLO_code, 4) AS UNSIGNED)
    `,

      [program_id]
    );

    // console.log(`Fetched PLOs for program_id ${program_id}:`, plos);

    res.json(plos);
    conn.release();
  } catch (err) {
    console.error("Error fetching PLOs:", err);
    res.status(500).send({ success: false, message: "Database error" });
  }
}

async function createOne(req, res) {
  const { PLO_name, PLO_engname, PLO_code, program_id, year } = req.body;

  // ตรวจสอบว่าข้อมูลครบถ้วน
  if (!PLO_name || !PLO_engname || !PLO_code || !program_id || !year) {
    return res.status(400).json({
      success: false,
      message: "All fields including year are required",
    });
  }

  try {
    const conn = await pool.getConnection();

    // ตรวจสอบว่า program_id และ year มีอยู่ในตาราง program
    const programCheck = await conn.query(
      "SELECT program_id FROM program WHERE program_id = ? AND year = ?",
      [program_id, year]
    );

    if (!programCheck || programCheck.length === 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: "Invalid program_id or year combination",
      });
    }

    // ตรวจสอบว่า PLO_code ซ้ำในปีเดียวกันหรือไม่
    const duplicateCheck = await conn.query(
      `
      SELECT p.PLO_id 
      FROM plo p
      INNER JOIN program_plo pp ON p.PLO_id = pp.PLO_id
      INNER JOIN program pr ON pp.program_id = pr.program_id
      WHERE p.PLO_code = ? AND pr.year = ?
    `,
      [PLO_code, year]
    );

    if (duplicateCheck && duplicateCheck.length > 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: `PLO with code "${PLO_code}" already exists for year ${year}`,
      });
    }

    // เพิ่ม PLO ลงในตาราง plo
    const ploQuery =
      "INSERT INTO plo (PLO_name, PLO_engname, PLO_code) VALUES (?, ?, ?)";
    const ploResult = await conn.query(ploQuery, [
      PLO_name,
      PLO_engname,
      PLO_code,
    ]);

    const newPloId = Number(ploResult.insertId);

    // เพิ่มความสัมพันธ์ระหว่าง program_id และ PLO_id ในตาราง program_plo
    const programPloQuery =
      "INSERT INTO program_plo (program_id, PLO_id) VALUES (?, ?)";
    await conn.query(programPloQuery, [program_id, newPloId]);

    conn.release();

    res.json({
      success: true,
      newPlo: {
        PLO_id: newPloId,
        PLO_name,
        PLO_engname,
        PLO_code,
        program_id,
        year,
      },
    });
  } catch (err) {
    console.error("Error adding PLO:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
}

async function createFromExcel(req, res) {
  const rows = req.body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Data should be a non-empty array" });
  }

  try {
    const conn = await pool.getConnection();

    // เก็บ PLO codes ที่จะเพิ่มเพื่อตรวจสอบความซ้ำซ้อนภายใน batch
    const batchPloCodes = new Set();
    const yearPloCodes = new Map(); // Map เพื่อเก็บ year -> Set of PLO codes

    // ตรวจสอบข้อมูลทั้งหมดก่อนเริ่ม insert
    for (const row of rows) {
      const { PLO_name, PLO_engname, PLO_code, program_id, year } = row;

      // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!PLO_name || !PLO_engname || !PLO_code || !program_id || !year) {
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Missing required fields in one of the rows: ${JSON.stringify(row)}`,
        });
      }

      // ตรวจสอบว่า program_id และ year มีอยู่
      const programCheck = await conn.query(
        "SELECT program_id FROM program WHERE program_id = ? AND year = ?",
        [program_id, year]
      );
      if (!programCheck || programCheck.length === 0) {
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Invalid program_id or year combination in row: ${JSON.stringify(row)}`,
        });
      }

      // ตรวจสอบความซ้ำซ้อนภายใน batch
      if (!yearPloCodes.has(year)) {
        yearPloCodes.set(year, new Set());
      }

      if (yearPloCodes.get(year).has(PLO_code)) {
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Duplicate PLO_code "${PLO_code}" found in batch for year ${year}`,
        });
      }

      yearPloCodes.get(year).add(PLO_code);
    }

    // ตรวจสอบความซ้ำซ้อนกับข้อมูลที่มีอยู่ในฐานข้อมูล
    for (const [year, codes] of yearPloCodes) {
      const codesArray = Array.from(codes);
      const placeholders = codesArray.map(() => "?").join(", ");

      const duplicateCheck = await conn.query(
        `
        SELECT p.PLO_code 
        FROM plo p
        INNER JOIN program_plo pp ON p.PLO_id = pp.PLO_id
        INNER JOIN program pr ON pp.program_id = pr.program_id
        WHERE p.PLO_code IN (${placeholders}) AND pr.year = ?
      `,
        [...codesArray, year]
      );

      if (duplicateCheck && duplicateCheck.length > 0) {
        const duplicateCodes = duplicateCheck.map((row) => row.PLO_code);
        conn.release();
        return res.status(400).json({
          success: false,
          message: `PLO codes already exist for year ${year}: ${duplicateCodes.join(", ")}`,
        });
      }
    }

    // หากผ่านการตรวจสอบทั้งหมด จึงเริ่ม insert ข้อมูล
    for (const row of rows) {
      const { PLO_name, PLO_engname, PLO_code, program_id } = row;

      // เพิ่ม PLO ลงในตาราง plo
      const ploQuery =
        "INSERT INTO plo (PLO_name, PLO_engname, PLO_code) VALUES (?, ?, ?)";
      const ploResult = await conn.query(ploQuery, [
        PLO_name,
        PLO_engname,
        PLO_code,
      ]);
      const newPloId = Number(ploResult.insertId);

      // เพิ่มความสัมพันธ์ระหว่าง program_id และ PLO_id
      const programPloQuery =
        "INSERT INTO program_plo (program_id, PLO_id) VALUES (?, ?)";
      await conn.query(programPloQuery, [program_id, newPloId]);
    }

    conn.release();
    res.json({ success: true, message: "All rows inserted successfully" });
  } catch (err) {
    console.error("Error processing Excel upload:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
}

export async function savePloCloMappings(req, res) {
  const year = parseInt(req.body.year);
  const course_id = parseInt(req.body.course_id);
  const mappings = req.body.mappings;

  if (!Array.isArray(mappings) || isNaN(year) || isNaN(course_id)) {
    return res.status(400).json({ error: "Invalid payload format" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ลบ mapping เดิมก่อน (ตามที่คุณต้องการ)
    await conn.query(
      `
      DELETE FROM plo_clo
      WHERE CLO_id IN (
        SELECT CLO_id FROM clo WHERE year = ? AND course_id = ?
      )
      `,
      [year, course_id]
    );

    for (const { clo_id, plo_id, weight } of mappings) {
      if (
        typeof clo_id !== "number" ||
        typeof plo_id !== "number" ||
        typeof weight !== "number"
      ) {
        throw new Error("Invalid mapping item");
      }

      await conn.query(
        `INSERT INTO plo_clo (PLO_id, CLO_id, weight)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE weight = VALUES(weight)`,
        [plo_id, clo_id, weight]
      );
    }

    await conn.commit();
    res.status(200).json({ message: "Mappings saved successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Error saving mappings:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
}

export async function getMapping(req, res) {
  const { course_id, year } = req.query;

  try {
    const rows = await pool.query(
      `
      SELECT pc.clo_id, pc.plo_id, pc.weight
      FROM plo_clo pc
      INNER JOIN clo c ON pc.clo_id = c.CLO_id
      WHERE c.course_id = ? AND c.year = ?
    `,
      [course_id, year]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching CLO-PLO mapping:", error);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
}

export { getManyByProgram, createOne, createFromExcel };
