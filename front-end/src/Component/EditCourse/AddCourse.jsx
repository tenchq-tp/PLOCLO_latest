import axios from "./../axios";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";


export default function AddCourse({
  newCourse,
  handleCourseChange,
  addCourse,
  allFiltersSelected,
  selectedProgram,
  selectedYear,
  selectedSemesterId,
}) {
  const { t, i18n } = useTranslation();

  const handleCourseExcelUpload = async (e) => {
  const file = e.target.files[0];
  e.target.value = "";

  console.log("Selected Program:", selectedProgram);

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log("Excel JSON Data:", jsonData);

      if (jsonData.length === 0) {
        alert("ไม่พบข้อมูลใน Excel");
        return;
      }

      if (!selectedProgram) {
        alert("กรุณาเลือกโปรแกรมก่อนอัปโหลด");
        return;
      }

      if (!selectedYear || !selectedSemesterId) {
        alert("กรุณาเลือกปีและภาคเรียนให้ครบถ้วน");
        return;
      }

      // แปลงข้อมูลให้ตรงกับรูปแบบ addCourse
      const dataToUpload = jsonData.map((row) => ({
        program_id: selectedProgram,
        course_id: row.course_id,
        course_name: row.course_name,
        course_engname: row.course_engname,
        semester_id: selectedSemesterId,
        year: selectedYear,
        section_id: row.section || 1, // ถ้าไม่มี section ให้ใช้ค่าเป็น 1
      }));

      console.log("Data to upload:", dataToUpload);

      // ส่งข้อมูลไปยัง API
      const response = await axios.post("/api/course/excel", dataToUpload, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          selectedYear: selectedYear,
          selectedSemester: selectedSemesterId,
        },
      });

      if (
        response.status === 201 ||
        response.data?.message === "เพิ่มรายวิชาทั้งหมดสำเร็จ!"
      ) {
        alert("เพิ่มรายวิชาสำเร็จแล้ว");
        fetchAllCourseByProgram(selectedProgram); // รีเฟรชข้อมูลรายวิชา
      } else {
        alert("เกิดข้อผิดพลาด: " + (response.data?.message || "ไม่สามารถอัปโหลดได้"));
      }
    } catch (err) {
      console.error("Error reading Excel file:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert("เกิดข้อผิดพลาด: " + err.response.data.message);
      } 
    }
  };

  reader.readAsArrayBuffer(file);
};

  return (
    <div className="mb-4">
      <h4>{t('Add Course')}</h4>
      <div className="d-flex flex-wrap align-items-end" style={{ gap: "10px" }}>
        <input
          className="form-control"
          placeholder={t('Course ID')}
          name="course_id"
          value={newCourse.course_id}
          onChange={handleCourseChange}
          style={{ width: "150px" }}
        />

        <input
          className="form-control"
          placeholder={t('Course Name (Thai)')}
          name="course_name"
          value={newCourse.course_name}
          onChange={handleCourseChange}
          style={{ width: "300px" }}
        />

        <input
          className="form-control"
          placeholder={t('Course Name (English)')}
          name="course_engname"
          value={newCourse.course_engname}
          onChange={handleCourseChange}
          style={{ width: "300px" }}
        />

        <input
          className="form-control"
          placeholder={t('Section')}
          name="section"
          value={newCourse.section}
          onChange={handleCourseChange}
          style={{ width: "100px" }}
        />

        <button
          onClick={addCourse}
          className="btn btn-success"
          disabled={!selectedSemesterId}
          style={{ width: "100px" }}
        >
          {t('Insert Course')}
        </button>

        <div>
          <button
            onClick={() => document.getElementById("uploadCourseFile").click()}
            className="btn btn-primary"
            disabled={!selectedSemesterId}

            style={{ width: "180px" }}
          >
            {t('Upload Excel (Course)')}
          </button>
          <input
            type="file"
            id="uploadCourseFile"
            style={{ display: "none" }}
            accept=".xlsx, .xls"
            onChange={handleCourseExcelUpload}

          />
        </div>
      </div>
    </div>


  );
}
