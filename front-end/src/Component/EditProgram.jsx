import React, { useState, useEffect } from "react";
import axios from "./axios";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import PreviousPLOs from "./EditProgram/PreviousPlo";
import AddProgram from "./EditProgram/AddProgram";
import EditProgramModal from "./EditProgram/EditProgramModal";

export default function Program() {
  const [program, setProgram] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedProgramName, setSelectedProgramName] = useState("");
  const [filteredProgram, setFilteredProgram] = useState([]);

  const [editProgram, setEditProgram] = useState(null);
  const [editFormData, setEditFormData] = useState({
    program_name: "",
    program_name_th: "",
    program_shortname_en: "",
    program_shortname_th: "",
    year: "",
  });
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [facultys, setFacultys] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [activeTab, setActiveTab] = useState(0);
  const { t, i18n } = useTranslation();

  // PLO Management states
  const [plos, setPlos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState({});
  const [weights, setWeights] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreviousYear, setSelectedPreviousYear] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlo, setNewPlo] = useState({
    PLO_code: "",
    PLO_name: "",
    PLO_engname: "",
  });
  const [selectedPlo, setSelectedPlo] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [allFiltersSelected, setAllFiltersSelected] = useState(false);
  const [showLoadPreviousPLOModal, setShowLoadPreviousPLOModal] =
    useState(false);
  const [previousYearPLOs, setPreviousYearPLOs] = useState([]);
  const [showPasteArea, setShowPasteArea] = useState(false);

  // -------> Edit Program Modal
  const [name, setName] = useState("Natthapong Pan-in");
  const [initialProgramValue, setInitialProgramValue] = useState({
    program_id: "",
    code: "",
    program_name: "",
    program_name_th: "",
    program_shortname_en: "",
    program_shortname_th: "",
    year: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  // ---------* Function *-----------
  async function fetchUniversity() {
    try {
      const response = await axios.get("/api/university");
      setUniversities(response.data);
    } catch {
      showAlert("ไม่สามารถโหลดรายชื่อมหาวิทยาลัยได้", "danger");
    }
  }

  async function fetchFaculty() {
    try {
      const response = await axios.get(
        `/faculty?university_id=${selectedUniversity}`
      );
      const facultyData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      setFacultys(facultyData);
      if (
        facultyData.length > 0 &&
        !facultyData.some((f) => f.faculty_id.toString() === selectedFaculty)
      ) {
        setSelectedFaculty("all");
      }
    } catch {
      showAlert("ไม่สามารถโหลดคณะได้", "danger");
      setFacultys([]);
      setSelectedFaculty("all");
    }
  }

  async function fetchPlo() {
    try {
      const result = await axios.get(
        `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
      );
      const response = await axios.get(
        `/api/plo?program_id=${result.data.program_id}`
      );
      setPlos(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAllProgram() {
    try {
      let url = `/api/program?`;
      if (selectedFaculty && selectedFaculty !== "all") {
        url += `faculty_id=${selectedFaculty}`;
      }

      const response = await axios.get(url);
      const programData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      setProgram(programData);
      if (selectedFaculty !== "all") {
        setFilteredProgram(programData);
      }
      const uniqueYears = [
        ...new Set(
          programData.map((p) => p.year).filter((year) => year != null)
        ),
      ];
      setYears(uniqueYears.sort((a, b) => a - b));
      if (
        selectedYear !== "all" &&
        !uniqueYears.includes(parseInt(selectedYear))
      ) {
        setSelectedYear("all");
      }
    } catch {
      setProgram([]);
      setFilteredProgram([]);
      setYears([]);
      setSelectedYear("all");
      setSelectedProgram("all");
    }
  }

  async function fetchProgram() {
    try {
      let url = `/api/program?`;
      if (selectedFaculty && selectedFaculty !== "all") {
        url += `faculty_id=${selectedFaculty}`;
      }

      if (selectedProgramName && selectedProgramName !== "all") {
        url += `&program_name=${selectedProgramName}`;
      }

      if (selectedYear && selectedYear !== "all") {
        url += `&year=${selectedYear}`;
      }

      const response = await axios.get(url);
      const programData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      if (selectedFaculty !== "all") {
        setFilteredProgram(programData);
      }
      const uniqueYears = [
        ...new Set(
          programData.map((p) => p.year).filter((year) => year != null)
        ),
      ];
      setYears(uniqueYears.sort((a, b) => a - b));
      if (
        selectedYear !== "all" &&
        !uniqueYears.includes(parseInt(selectedYear))
      ) {
        setSelectedYear("all");
      }
    } catch {
      setProgram([]);
      setFilteredProgram([]);
      setYears([]);
      setSelectedYear("all");
      setSelectedProgram("all");
    }
  }
  useEffect(() => {
    fetchUniversity();
  }, []);

  useEffect(() => {
    if (!selectedUniversity || selectedUniversity === "all") {
      setFacultys([]);
      setSelectedFaculty("all");
      return;
    }
    fetchFaculty();
  }, [selectedUniversity]);

  useEffect(() => {
    if (!selectedFaculty || selectedFaculty === "all") {
      setProgram([]);
      setFilteredProgram([]);
      setYears([]);
      setSelectedYear("all");
      setSelectedProgramName("all");
      return;
    } else {
      setSelectedProgramName("all");
      fetchAllProgram();
    }
    console.log("selectedProgram ",);
  }, [selectedFaculty]);

  useEffect(() => {
    fetchProgram();
    if (
      selectedUniversity &&
      selectedProgramName &&
      selectedYear &&
      selectedFaculty &&
      selectedFaculty !== "all" &&
      selectedProgramName !== "all" &&
      selectedUniversity !== "all" &&
      selectedYear !== "all"
    ) {
      setAllFiltersSelected(true);
    } else {
      setAllFiltersSelected(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (allFiltersSelected) {
      fetchPlo();
    }
  }, [allFiltersSelected]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    fetchProgram();
    setSelectedYear("all");
  }, [selectedProgramName]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
  };

  const handleEditProgram = () => {
    axios
      .put(`/program/${editProgram.program_id}/update`, {
        program_name: editFormData.program_name,
        program_name_th: editFormData.program_name_th,
        year: editFormData.year,
        program_shortname_en: editFormData.program_shortname_en,
        program_shortname_th: editFormData.program_shortname_th,
      })
      .then(() => {
        const updatedProgram = program.map((p) =>
          p.program_id === editProgram.program_id
            ? {
              ...p,
              program_name: editFormData.program_name,
              program_name_th: editFormData.program_name_th,
              year: editFormData.year,
              program_shortname_en: editFormData.program_shortname_en,
              program_shortname_th: editFormData.program_shortname_th,
            }
            : p
        );
        setProgram(updatedProgram);

        // Reset edit state
        setEditProgram(null);
        setEditFormData({
          program_name: "",
          program_name_th: "",
          program_shortname_en: "",
          program_shortname_th: "",
          year: "",
        });

        // Show success alert
        showAlert("แก้ไขหลักสูตรเรียบร้อยแล้ว", "success");
      })
      .catch((error) => {
        console.error("Error editing program:", error);
        showAlert("เกิดข้อผิดพลาดในการแก้ไขหลักสูตร", "danger");
      });
  };

  const handleDeleteProgram = (program_id) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this program?\nคุณต้องการลบหลักสูตรนี้ใช่หรือไม่?")) {
      return;
    }

    axios
      .delete(`/api/program/${program_id}/delete`)
      .then(() => {
        const updatedProgram = program.filter(
          (p) => p.program_id !== program_id
        );
        setProgram(updatedProgram);

        // Also update the filtered list
        const updatedFiltered = filteredProgram.filter(
          (p) => p.program_id !== program_id
        );
        setFilteredProgram(updatedFiltered);

        // Show success alert
        showAlert("ลบหลักสูตรเรียบร้อยแล้ว", "success");
      })
      .catch((error) => {
        console.error("Error deleting program:", error);
        showAlert("เกิดข้อผิดพลาดในการลบหลักสูตร", "danger");
      });
  };

  const handleUniversityChange = (e) => {
    setSelectedUniversity(e.target.value);
  };

  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
    setShowLoadPreviousPLOModal(false); // ปิด modal เมื่อเปลี่ยนแท็บ
  };
  const handleDeletePlo = async (ploId) => {
    if (window.confirm("Are you sure you want to delete this PLO?\nคุณต้องการลบ PLO นี้ใช่หรือไม่?")) {
      try {
        const result = await axios.get(
          `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
        );
        const programId = parseInt(result.data.program_id);
        const ploIdInt = parseInt(ploId);

        if (isNaN(programId) || isNaN(ploIdInt)) {
          throw new Error("Invalid program ID or PLO ID");
        }

        // ส่งคำขอ DELETE ด้วยข้อมูล program_id และ plo_id ที่แปลงแล้ว
        const response = await axios.delete(
          `/api/program/plo?program_id=${programId}&plo_id=${ploIdInt}`
        );
        // setPlos(plos.filter((plo) => plo.plo_id !== ploId));
        fetchPlo();
        window.alert("PLO deleted successfully");
      } catch (error) {
        console.error("Error deleting PLO:", error);
        window.alert("An error occurred while deleting the PLO");
      }
    }
  };

  const refreshDataFromServer = async () => {
    try {
      if (!selectedProgram || selectedProgram === "all" || !selectedYear)
        return false;

      // ค้นหาโปรแกรมที่มี program_id ตรงกับที่เลือก
      let selectedProgramObj = program.find(
        (p) => p.program_id === parseInt(selectedProgram)
      );

      // ตรวจสอบว่าโปรแกรมที่เลือกนั้นตรงกับปีที่เลือกหรือไม่
      if (
        selectedProgramObj &&
        selectedProgramObj.year !== parseInt(selectedYear)
      ) {
        // ถ้าไม่ตรงกัน ค้นหาโปรแกรมที่มีชื่อเดียวกันและอยู่ในปีที่เลือก
        const matchingProgram = program.find(
          (p) =>
            p.program_name === selectedProgramObj.program_name &&
            p.program_name_th === selectedProgramObj.program_name_th &&
            p.year === parseInt(selectedYear)
        );

        if (matchingProgram) {
          selectedProgramObj = matchingProgram;
          // อัพเดต selectedProgram เป็น ID ที่ถูกต้องสำหรับปีที่เลือก โดยไม่มีผลกับการแสดงผลใน dropdown
        } else {
          // ไม่พบโปรแกรมที่ตรงกับปีที่เลือก
          // แจ้งเตือนให้ผู้ใช้ทราบแต่ไม่เปลี่ยนแปลงค่าที่แสดงใน dropdown
          return false; // ไม่ดำเนินการต่อ
        }
      }

      if (!selectedProgramObj) return false;

      // 1. รีเฟรช PLO data
      const ploResponse = await fetch(
        `http://localhost:8000/program_plo?program_id=${selectedProgramObj.program_id}`
      );
      const ploData = await ploResponse.json();

      console.log("Refreshed PLO data:", ploData);

      if (ploData.success && ploData.message && ploData.message.length > 0) {
        setPlos(ploData.message);
      } else if (Array.isArray(ploData) && ploData.length > 0) {
        setPlos(ploData);
      } else {
        setPlos([]);
      }

      // 2. รีเฟรช Course data
      const courseResponse = await fetch(
        `http://localhost:8000/course?program_id=${selectedProgramObj.program_id}&year=${selectedYear}`
      );

      if (!courseResponse.ok) {
        throw new Error(`HTTP error! status: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      console.log("Refreshed Course data:", courseData);

      if (Array.isArray(courseData)) {
        setCourses(courseData);
      } else if (courseData.success && Array.isArray(courseData.message)) {
        setCourses(courseData.message);
      } else if (courseData.success && courseData.message) {
        setCourses([courseData.message]);
      } else {
        setCourses([]);
      }

      // 3. รีเฟรช weights data
      const mappingResponse = await fetch(
        `http://localhost:8000/course_plo?program_id=${selectedProgramObj.program_id}&year=${selectedYear}`
      );
      const mappingData = await mappingResponse.json();

      console.log("Refreshed mapping data:", mappingData);
      const weightsData = {};

      if (mappingData.success && Array.isArray(mappingData.message)) {
        mappingData.message.forEach((item) => {
          const key = `${item.course_id}-${item.plo_id}`;
          weightsData[key] = item.weight;
        });
      } else if (Array.isArray(mappingData)) {
        mappingData.forEach((item) => {
          const key = `${item.course_id}-${item.plo_id}`;
          weightsData[key] = item.weight;
        });
      } else if (mappingData.success && mappingData.message) {
        const key = `${mappingData.message.course_id}-${mappingData.message.plo_id}`;
        weightsData[key] = mappingData.message.weight;
      }

      // รอให้การอัพเดต state เสร็จสิ้น
      await new Promise((resolve) => {
        setWeights(weightsData);
        setTimeout(resolve, 100);
      });

      console.log("Data refresh completed successfully");
      return true;
    } catch (error) {
      console.error("Error in refreshDataFromServer:", error);
      return false;
    }
  };
  const handleMergePLOs = async () => {
    if (!previousYearPLOs || previousYearPLOs.length === 0) {
      window.alert("ไม่มีข้อมูล PLO จากปีก่อนหน้าที่จะทำการรวม");
      return;
    }

    if (!selectedProgramName || selectedProgramName === "all") {
      window.alert("กรุณาเลือกโปรแกรมปัจจุบันที่ต้องการรวม PLO");
      return;
    }

    const confirmation = window.confirm(
      `Do you want to merge ${previousYearPLOs.length} PLOs from the previous year into the current program?\nคุณต้องการรวม ${previousYearPLOs.length} PLO จากปีก่อนหน้าเข้ากับโปรแกรมปัจจุบันใช่หรือไม่?`
    );
    if (!confirmation) return;

    // สร้าง requests สำหรับการเพิ่ม PLO แต่ละรายการ
    const result = await axios.get(
      `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
    );
    const ploPatchRequests = previousYearPLOs.map((plo) => {
      // เตรียมข้อมูลสำหรับสร้าง PLO ใหม่
      const newPloData = {
        PLO_name: plo.PLO_name,
        PLO_engname: plo.PLO_engname,
        PLO_code: plo.PLO_code,
        program_id: parseInt(result.data.program_id),
        year: parseInt(selectedYear), // เพิ่มปีที่เลือกปัจจุบัน
      };

      // ส่งคำขอไปยัง API
      return axios.post("/plo", newPloData).catch((error) => {
        console.error(`เกิดข้อผิดพลาดในการเพิ่ม PLO ${plo.PLO_code}:`, error);
        return { data: { success: false, error: error.message } };
      });
    });

    // ดำเนินการเพิ่ม PLOs ทั้งหมดพร้อมกัน
    Promise.all(ploPatchRequests)
      .then((responses) => {
        // กรองเฉพาะที่สำเร็จ
        const successfulAdds = responses.filter(
          (response) => response.data && response.data.success
        );

        if (successfulAdds.length === 0) {
          window.alert(
            "ไม่สามารถเพิ่ม PLO ได้ กรุณาตรวจสอบ console สำหรับรายละเอียดข้อผิดพลาด"
          );
        } else {
          window.alert(
            `Successfully added ${successfulAdds.length} PLO(s) out of ${ploPatchRequests.length}.\nเพิ่ม PLO สำเร็จ ${successfulAdds.length} รายการ จากทั้งหมด ${ploPatchRequests.length} รายการ`
          );
        }

        // ปิด modal
        setShowLoadPreviousPLOModal(false);

        // รีเฟรชข้อมูล PLO
        return refreshDataFromServer();
      })
      .then((refreshSuccess) => {
        if (refreshSuccess) {
          console.log("รีเฟรชข้อมูลสำเร็จหลังจากการรวม PLO");
        } else {
          console.warn(
            "ไม่สามารถรีเฟรชข้อมูลหลังการรวม PLO อัตโนมัติ กรุณารีเฟรชหน้าจอ"
          );
        }
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการรวม PLOs:", error);
        window.alert("เกิดข้อผิดพลาดในการรวม PLOs: " + error.message);
      });
    fetchPlo();
  };

  const handleFileUpload = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];

    // รีเซ็ตค่าของอินพุตไฟล์เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้
    e.target.value = "";

    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // เพิ่ม program_id ที่ผู้ใช้เลือกเข้าไปในแต่ละแถว
            const updatedData = jsonData.map((row) => ({
              ...row,
              program_id: selectedProgram, // เพิ่ม program_id ที่เลือกจาก UI
            }));

            setExcelData(updatedData); // เก็บข้อมูลจากไฟล์
            console.log(updatedData);
            // The modal will automatically be shown because it's conditionally rendered based on excelData
          } catch (error) {
            console.error("Error reading file:", error);
            alert("Error reading Excel file. Please check the file format.");
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          alert("Error reading file. Please try again.");
        };
        reader.readAsBinaryString(selectedFile);
      } else {
        setTypeError("Please select only Excel file types");
        setExcelData(null);
      }
    } else {
      console.log("Please select your file");
    }
  };

  const handleUploadButtonClick = async () => {
    if (excelData && excelData.length > 0) {
      // ตรวจสอบว่าได้เลือกโปรแกรมแล้วหรือไม่
      if (!selectedProgramName || selectedProgramName === "all") {
        alert("กรุณาเลือกโปรแกรมก่อนอัปโหลดข้อมูล");
        return;
      }

      // ตรวจสอบว่าได้เลือกปีแล้วหรือไม่
      if (!selectedYear || selectedYear === "all") {
        alert("กรุณาเลือกปีการศึกษาก่อนอัปโหลดข้อมูล");
        return;
      }

      // แสดง confirmation dialog
      if (
        !window.confirm(
          "Do you want to upload " +
          excelData.length +
          " PLO records?" +
          "\n" +
          "คุณต้องการอัปโหลดข้อมูล PLO จำนวน " +
          excelData.length +
          " รายการใช่หรือไม่?"
        )
      ) {
        return;
      }
      const result = await axios.get(
        `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
      );
      // เตรียมข้อมูลสำหรับส่งไปยัง API
      const dataToUpload = excelData.map((item) => ({
        ...item,
        program_id: result.data.program_id,
        year: parseInt(selectedYear), // เพิ่มข้อมูลปีการศึกษา
      }));

      try {
        console.log(dataToUpload);
        const response = await axios.post("/plo/excel", dataToUpload);

        const data = await response.data;
        window.alert("Data uploaded successfully\nอัปโหลดข้อมูลสำเร็จ");

        // รีเฟรชข้อมูล PLO หลังจากอัปโหลด โดยเพิ่มพารามิเตอร์ year
        const selectedProgramObj = program.find(
          (p) =>
            p.program_id === parseInt(selectedProgram) &&
            p.year === parseInt(selectedYear)
        );

        if (selectedProgramObj) {
          try {
            const ploResponse = await fetch(
              `http://localhost:8000/program_plo?program_id=${selectedProgramObj.program_id}&year=${selectedYear}`
            );

            const ploData = await ploResponse.json();
            console.log("Refreshed PLO data:", ploData);

            if (
              ploData.success &&
              ploData.message &&
              ploData.message.length > 0
            ) {
              setPlos(ploData.message);
            } else if (Array.isArray(ploData) && ploData.length > 0) {
              setPlos(ploData);
            } else {
              setPlos([]);
            }
          } catch (error) {
            console.error("Error refreshing PLO data:", error);
            refreshDataFromServer();
          }
        } else {
          refreshDataFromServer();
        }

        // ล้างข้อมูลหลังจากอัปโหลดสำเร็จ
        setExcelData(null);
        fetchPlo();
      } catch (error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    } else {
      alert("ไม่มีข้อมูลที่จะอัปโหลด กรุณาอัปโหลดไฟล์หรือวางข้อมูลก่อน");
    }
  };

  const handleAddPlo = () => {
    fetch("http://localhost:8000/plo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PLO_name: newPlo.PLO_name,
        PLO_engname: newPlo.PLO_engname,
        PLO_code: newPlo.PLO_code,
        program_id: selectedProgram,
        year: parseInt(selectedYear), // เพิ่มการส่งค่าปี
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // อัปเดต PLO ใหม่ใน state และแน่ใจว่ามีข้อมูลปีด้วย
          const newPloWithYear = {
            ...data.newPlo,
            year: parseInt(selectedYear), // เพิ่มข้อมูลปีให้กับ PLO ใหม่
          };
          setPlos([...plos, newPloWithYear]);
          setShowAddModal(false);
          alert("PLO added successfully");
        } else {
          alert("Error adding PLO: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error adding PLO:", error);
        alert("An error occurred while adding the PLO");
      });
  };

  // แก้ไขฟังก์ชัน handleEditPlo
  const handleEditPlo = (plo) => {
    setSelectedPlo(plo.PLO_id); // เก็บ plo_id ไว้ใช้ตอนอัปเดต
    setNewPlo({
      PLO_code: plo.PLO_code,
      PLO_name: plo.PLO_name,
      PLO_engname: plo.PLO_engname,
    });
    setShowEditModal(true); // เปิด modal แก้ไข
  };
  const handleSaveEdit = async () => {
    try {
      const result = await axios.get(
        `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
      );
      console.log("Payload sent to backend:", {
        program_id: result.data.program_id,
        PLO_id: selectedPlo,
        PLO_code: newPlo.PLO_code,
        PLO_name: newPlo.PLO_name,
        PLO_engname: newPlo.PLO_engname,
      });
      const response = await axios.put("/api/program/plo", {
        program_id: result.data.program_id, // ต้องแน่ใจว่ามีค่าตัวนี้
        PLO_id: selectedPlo,
        PLO_code: newPlo.PLO_code,
        PLO_name: newPlo.PLO_name,
        PLO_engname: newPlo.PLO_engname,
      });

      if (response.data.success) {
        window.alert("PLO updated successfully");
        setShowEditModal(false); // ปิด modal
        fetchPlo(); // โหลดข้อมูลใหม่
      } else {
        window.alert(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating PLO:", error);
      window.alert("An error occurred while updating the PLO");
    }
  };

  useEffect(() => {
  }, [showLoadPreviousPLOModal]);

  const handleLoadPreviousPLO = async () => {
    try {
      // ตรวจสอบว่าได้เลือกฟิลเตอร์ที่จำเป็นครบถ้วนแล้ว
      if (
        !selectedUniversity ||
        selectedUniversity === "all" ||
        !selectedFaculty ||
        selectedFaculty === "all" ||
        !selectedProgramName ||
        selectedProgramName === "all" ||
        !selectedYear ||
        selectedYear === "all"
      ) {
        alert(
          "กรุณาเลือก มหาวิทยาลัย, คณะ, โปรแกรม และปีการศึกษาให้ครบถ้วนก่อน"
        );
        return;
      }

      // คำนวณปีการศึกษาก่อนหน้า
      const currentYear = parseInt(selectedYear);
      const previousYear = currentYear - 1;

      // !! สำคัญ: เปิด modal ทันทีและล้างข้อมูลเก่า
      setPreviousYearPLOs([]);
      setShowLoadPreviousPLOModal(true);

      if (previousYear < 2022) {
        return;
      }

      // หาโปรแกรมปัจจุบัน
      // const currentProgram = program.find(
      //   (p) => p.program_id === parseInt(selectedProgram)
      // );
      const result = await axios.get(
        `/api/program/id?program_name=${selectedProgramName}&program_year=${selectedYear}`
      );
      const currentProgram = result.data.program_id;
      if (!currentProgram) {
        console.error("ไม่พบข้อมูลโปรแกรมที่เลือกในปัจจุบัน");
        return;
      }
      // ดึงข้อมูลโปรแกรมของปีก่อนหน้า
      try {
        const response = await axios.get(
          `api/program?faculty_id=${selectedFaculty}&year=${previousYear}`
        );

        const data = await response.data;

        // แปลงข้อมูลโปรแกรม
        let programs = [];
        if (Array.isArray(data)) {
          programs = data;
        } else if (data?.success && Array.isArray(data.message)) {
          programs = data.message;
        } else if (
          data?.success &&
          data.message &&
          !Array.isArray(data.message)
        ) {
          programs = [data.message];
        } else if (data && !Array.isArray(data)) {
          programs = [data];
        }

        // กรองโปรแกรมที่มีปีตรงกับปีที่ต้องการ
        programs = programs.filter((p) => parseInt(p.year) === previousYear);
        if (!programs || programs.length === 0) {
          return;
        }
        const previousYearProgram = programs.find(
          (p) => p.program_name === selectedProgramName
        );

        if (!previousYearProgram) {
          return;
        }

        // ดึงข้อมูล PLO
        const ploResponse = await fetch(
          `http://localhost:8000/program_plo?program_id=${previousYearProgram.program_id}`
        );

        if (!ploResponse.ok) {
          return;
        }

        const ploData = await ploResponse.json();

        // แปลงข้อมูล PLO
        let previousPLOs = [];
        if (ploData?.success && Array.isArray(ploData.message)) {
          previousPLOs = ploData.message;
        } else if (Array.isArray(ploData)) {
          previousPLOs = ploData;
        } else if (
          ploData?.success &&
          ploData.message &&
          !Array.isArray(ploData.message)
        ) {
          previousPLOs = [ploData.message];
        } else if (ploData && !Array.isArray(ploData)) {
          previousPLOs = [ploData];
        }

        if (previousPLOs.length > 0) {
          const plosWithYear = previousPLOs.map((plo) => ({
            ...plo,
            sourceYear: previousYear,
          }));
          setPreviousYearPLOs(plosWithYear);
        }
      } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการโหลด PLO:`, error);
        // modal ยังคงแสดงอยู่แม้มี error
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในฟังก์ชัน handleLoadPreviousPLO:", error);
      // ตรวจสอบว่า modal เปิดแล้วหรือยัง
      setShowLoadPreviousPLOModal(true);
    }
  };

  async function updateProgramToDatabase(updatedProgram) {
    await axios.put(
      `/api/program/${updatedProgram.program_id}/update`,
      updatedProgram
    );
  }

  const handleSaveProgram = async (updatedProgram) => {
    try {
      await updateProgramToDatabase(updatedProgram);
      setInitialProgramValue(updatedProgram);

      setShowPopup(false);
      fetchProgram();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const pageStyle = {
    backgroundColor: "#ffffff",
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  };

  const headerStyle = {
    color: "#333333",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "15px",
    marginBottom: "20px",
    textAlign: "center",
  };

  const formGroupStyle = {
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
  };

  const labelStyle = {
    width: "180px",
    marginRight: "10px",
  };

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    minWidth: "250px",
  };

  const buttonStyle = {
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    padding: "8px 16px",
    margin: "5px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#d93025",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    border: "1px solid #ddd",
  };

  const thStyle = {
    backgroundColor: "#f2f2f2",
    padding: "10px",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  };

  const tdStyle = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  };

  return (
    <div
      className="mb-3"
      style={{ paddingTop: "80px", maxWidth: "1000px", marginLeft: "20px" }}>
      <div
        style={{
          position: "fixed", // เปลี่ยนจาก sticky เป็น fixed เพื่อให้ติดอยู่ที่ตำแหน่งเดิมตลอด
          top: 0,
          left: 0, // กำหนดให้ชิดซ้ายของหน้าจอ
          right: 0, // กำหนดให้ขยายไปถึงขอบขวาของหน้าจอ
          zIndex: 1000,
          marginLeft: "250px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #eee",
        }}>
        {/* หัวข้อหลักสูตรและแถบเมนู */}
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 0",
            marginLeft: "15px",
            padding: "0 15px",
          }}>
          <h3
            className="mb-0"
            style={{ fontSize: "1.4rem", padding: "10px 0", marginTop: 15 }}>
            {t("Program Information")}
          </h3>

          {/* แถบเมนู */}
          <ul
            className="tab-bar"
            style={{
              margin: 0,
              padding: "5px 0 10px 5px",
              borderBottom: "none",
            }}>
            <li
              className={`tab-item ${activeTab === 0 ? "active" : ""}`}
              onClick={() => handleTabClick(0)}>
              {t("General Information")}
            </li>
            <li
              className={`tab-item ${activeTab === 1 ? "active" : ""}`}
              onClick={() => handleTabClick(1)}>
              {t("Program Learning Outcomes (PLO)")}
            </li>
            {/* <li className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => handleTabClick(2)}>{t('PLO-Course Mapping')}</li> */}
          </ul>

          {/* จัดให้ 4 element อยู่ในแถวเดียวกัน */}
          <div
            className="d-flex flex-row"
            style={{ flexWrap: "nowrap", marginTop: "0px" }}>
            <div className="mb-3 me-2" style={{ width: "380px" }}>
              <label className="form-label">{t('Choose a university')}</label>
              <select
                className="form-select" // ตัดคลาสเพิ่มเติมออก
                style={{ width: "320px" }} // ใช้ style inline แทน
                value={selectedUniversity}
                onChange={handleUniversityChange}>
                <option value="all">{t('All Universities')}</option>
                {universities.map((university) => (
                  <option
                    key={university.university_id}
                    value={university.university_id}>
                    {university.university_name_en} (
                    {university.university_name_th})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 me-2" style={{ width: "380px" }}>
              <label className="form-label text-start">{t('Choose a Faculty')}</label>
              <select
                className="form-select" // ตัดคลาสเพิ่มเติมออก
                style={{ width: "350px" }} // ใช้ style inline แทน
                value={selectedFaculty}
                onChange={handleFacultyChange}
                disabled={!selectedUniversity}>
                <option value="all">{t('All Facultys')}</option>
                {facultys.map((faculty) => (
                  <option key={faculty.faculty_id} value={faculty.faculty_id}>
                    {faculty.faculty_name_th} ({faculty.faculty_name_en})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 me-2" style={{ width: "380px" }}>
              <label className="form-label text-start">{t('Choose a Program')}</label>
              <select
                className="form-select" // ตัดคลาสเพิ่มเติมออก
                style={{ width: "380px" }} // ใช้ style inline แทน
                value={selectedProgramName || "all"}
                onChange={(e) => setSelectedProgramName(e.target.value)}
                disabled={!selectedFaculty}>
                <option value="all">{t('All Programs')}</option>
                {program
                  .filter(
                    (item, index, self) =>
                      index ===
                      self.findIndex(
                        (p) =>
                          p.program_name === item.program_name &&
                          p.program_name_th === item.program_name_th
                      )
                  )
                  .map((p) => (
                    <option key={p.program_id} value={p.program_name}>
                      {p.program_name} ({p.program_name_th || ""})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3" style={{ width: "120px" }}>
              <label className="form-label text-start">{t('Year')}</label>
              <select
                className="form-select" // ตัดคลาสเพิ่มเติมออก
                style={{ width: "120px" }} // ใช้ style inline แทน
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedProgram}>
                <option value="all">{t('All Years')}</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* เพิ่ม padding ด้านบนของเนื้อหาเพื่อไม่ให้โดนแถบเมนูทับ */}
      <div
        style={{
          paddingTop: "10px", // ต้องเพิ่ม padding ให้มากพอสำหรับความสูงของแถบเมนู
          padding: "120px 15px 0 15px",
        }}>
        {/* เนื้อหาแท็บต่างๆ */}
        <div
          className={`tab-content ${activeTab === 0 ? "active" : ""}`}
          style={{ marginTop: 10, marginBottom: 50, width: "75vw" }}>
          <h3>{t('Program Management')}</h3>
          <hr className="my-4" />

          {/* Alert notification */}
          {alert.show && (
            <div
              className={`alert alert-${alert.type} alert-dismissible fade show`}
              role="alert">
              {alert.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlert({ ...alert, show: false })}></button>
            </div>
          )}

          <h5>{t('Program')}</h5>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-bordered mt-3">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <tr>
                  <th>{t('Program Code')}</th>
                  <th>{t('Program Name')}</th>
                  <th>{t('ชื่อหลักสูตร (ไทย)')}</th>
                  <th>{t('Short Name')}</th>
                  <th>{t('ชื่อย่อ (ไทย)')}</th>
                  <th>{t('Year')}</th>
                  <th>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
  {filteredProgram
    .sort((a, b) => (a.year || 0) - (b.year || 0)) // เรียงจาก year น้อย → มาก
    .map((p) => (
      <tr key={p.program_id}>
        <td>{p.code}</td>
        <td>{p.program_name}</td>
        <td>{p.program_name_th || "-"}</td>
        <td>{p.program_shortname_en || "-"}</td>
        <td>{p.program_shortname_th || "-"}</td>
        <td>{p.year || "-"}</td>
        <td>
          <div className="d-flex justify-content-center" style={{ gap: "5px" }}>
            <button
              className="btn btn-primary btn-sm ms-2"
              onClick={() => {
                setInitialProgramValue({
                  program_id: p.program_id,
                  code: p.code,
                  program_name: p.program_name,
                  program_name_th: p.program_name_th,
                  program_shortname_en: p.program_shortname_en,
                  program_shortname_th: p.program_shortname_th,
                  year: p.year,
                });
                setShowPopup(true);
              }}>
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteProgram(p.program_id)}>
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
</tbody>

            </table>
          </div>



          {showPopup && (
            <EditProgramModal
              initialValue={initialProgramValue}
              onSave={handleSaveProgram}
              onCancel={() => setShowPopup(false)}
            />
          )}
          <hr className="my-4" />
          <AddProgram
            setAlert={setAlert}
            selectedFaculty={selectedFaculty}
            setFilteredProgram={setFilteredProgram}
            filteredProgram={filteredProgram}
            setProgram={setProgram}
            program={program}
          />
          <hr className="my-4" />

          {/* Updated section to edit an existing program with all fields */}
        </div>
        <div
          className={`tab-content ${activeTab === 1 ? "active" : ""}`}
          style={{ marginTop: 10, marginBottom: 50 }}>
          <div
            style={{
              backgroundColor: "#F0F0F0",
              minHeight: "0vh",
              paddingTop: "0px",
              width: "75vw",
            }}>
            <div className="plo-management-container ">
              <h3>{t('PLO Management')}</h3>

              <hr className="my-4" />

              <h5>{t('PLO List')}</h5>

              <div className="action-buttons">
                <div className="button-group">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn"
                    style={{ backgroundColor: "#FF8C00", color: "white" }}
                    disabled={!allFiltersSelected}>
                    {t('Add PLO')}
                  </button>

                  <button
                    onClick={handleLoadPreviousPLO}
                    className="btn btn-secondary"
                    disabled={!allFiltersSelected}>
                    {t('Load Previous Year PLOs')}
                  </button>
                </div>

                <div className="button-group ms-auto">
                  <button
                    onClick={() =>
                      document.getElementById("uploadFile").click()
                    }
                    className="btn btn-secondary"
                    disabled={!allFiltersSelected}>
                    {t('Upload Excel')}
                  </button>
                  <input
                    type="file"
                    id="uploadFile"
                    style={{ display: "none" }}
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {typeError && (
                <div className="alert alert-danger mb-3">{typeError}</div>
              )}

              {!allFiltersSelected ? (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "16px", color: "#666" }}>
                    Please select all options to display PLO data.
                  </p>
                  <p style={{ fontSize: "16px", color: "#666" }}>
                    กรุณาเลือกตัวเลือกให้ครบเพื่อแสดงข้อมูล PLO
                  </p>
                </div>
              ) : (
                <>
                  {/* แสดงข้อความเมื่อเลือกฟิลเตอร์ครบแล้ว แต่ไม่มีข้อมูล */}
                  {selectedYear !== "all" && !plos.length && (
                    <div className="alert alert-info mt-4" style={{ textAlign: "center" }}>
                      {!plos.length ? (
                        <>
                          No PLO data found for the academic year {selectedYear}.<br />
                          ไม่พบข้อมูล PLO สำหรับปีการศึกษา {selectedYear}
                        </>
                      ) : null}
                    </div>


                  )}

                  {/* PLO Table - แสดงเฉพาะเมื่อเลือก filters ครบแล้ว และมีข้อมูล */}
                  {selectedYear !== "all" &&
                    plos.length > 0 &&
                    courses.length >= 0 && (
                      <div className="plo-table-container">
                        <table className="plo-table">
                          <thead>
                            <tr>
                              <th className="plo-code-col">{t('PLO Code')}</th>
                              <th className="plo-name-col">{t('PLO Name')}</th>
                              <th className="plo-actions-col">{t('Actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
  {plos.length > 0 ? (
    [...plos]
      .sort((a, b) => {
        const numA = parseInt(a.PLO_code.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.PLO_code.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      })
      .map((plo) => (
        <tr key={plo.PLO_id}>
          <td>
            <div className="plo-cell-content text-center">
              {plo.PLO_code}
            </div>
          </td>
          <td>
            <div className="plo-cell-content">{plo.PLO_name}</div>
            {plo.PLO_engname && (
              <>
                <div className="my-1 border-t border-gray-300"></div>
                <div className="plo-cell-secondary">{plo.PLO_engname}</div>
              </>
            )}
          </td>
          <td>
            <button
              className="plo-table-btn plo-edit-btn"
              onClick={() => handleEditPlo(plo)}
            >
              {t("Edit")}
            </button>
            <button
              className="plo-table-btn plo-delete-btn"
              onClick={() => handleDeletePlo(plo.PLO_id)}
            >
              {t("Delete")}
            </button>
          </td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center">
        No PLO data found for the selected filters.
      </td>
    </tr>
  )}
</tbody>

                        </table>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
        {showAddModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {t('Add New PLO')} ({t('Year')} {selectedYear})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label>{t('PLO Code')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_code}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label>{t('PLO Name (TH)')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_name}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label>{t('PLO Name (EN)')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_engname}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_engname: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleAddPlo}>
                    {t('Add')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}>
                    {t('Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit PLO (ปี {selectedYear})</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowEditModal(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">{('PLO Code')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_code}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">{t('PLO Name (TH)')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_name}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">{t('PLO Name (EN)')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPlo.PLO_engname}
                      onChange={(e) =>
                        setNewPlo({ ...newPlo, PLO_engname: e.target.value })
                      }
                    />
                  </div>

                  {/* ถ้าต้องการส่ง year ไปพร้อมกัน */}
                  <input type="hidden" name="year" value={selectedYear} />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveEdit}>
                    {t('Save')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}>
                    {t('Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {excelData !== null && excelData.length > 0 && (
          <div>{excelData && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("Excel Data Preview")}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setExcelData(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {excelData.length > 0 ? (
                      <>
                        <p>{t("Found")} {excelData.length} {t("PLO records from Excel file.")}</p>
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                              <tr>
                                <th>{t("PLO Code")}</th>
                                <th>{t("PLO Name")}</th>
                                <th>{t("PLO Name (EN)")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {excelData.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.PLO_code || "-"}</td>
                                  <td>{item.PLO_name || "-"}</td>
                                  <td>{item.PLO_engname || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <p>{t("No data found in the Excel file.")}</p>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setExcelData(null)}
                    >
                      {t("Cancel")}
                    </button>
                    {excelData.length > 0 && (
                      <button
                        className="btn btn-success"
                        onClick={handleUploadButtonClick}
                      >
                        {t("Save")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>
        )}
        {showLoadPreviousPLOModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {t('PLOs from previous year')} ({parseInt(selectedYear) - 1})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLoadPreviousPLOModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {previousYearPLOs.length > 0 ? (
                    <>
                      <p>
                        {t('Found')} {previousYearPLOs.length} {t('PLOs from previous year')}
                      </p>
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>{t('PLO Code')}</th>
                              <th>{t('PLO Name')}</th>
                              <th>{t('PLO Name (EN)')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previousYearPLOs.map((plo, index) => (
                              <tr key={index}>
                                <td>{plo.PLO_code || "-"}</td>
                                <td>{plo.PLO_name || "-"}</td>
                                <td>{plo.PLO_engname || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p>{t('No PLO records found from the previous year.')}</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLoadPreviousPLOModal(false)}
                  >
                    {t('Cancel')}
                  </button>
                  {previousYearPLOs.length > 0 && (
                    <button className="btn btn-success" onClick={handleMergePLOs}>
                      {t('Import PLOs')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}