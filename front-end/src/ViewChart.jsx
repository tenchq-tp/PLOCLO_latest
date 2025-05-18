import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Doughnut, Radar } from "react-chartjs-2";

// ลงทะเบียน Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

function ViewChart() {
  const [courseData, setCourseData] = useState([]);
  const [studentPLOData, setStudentPLOData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "info", message: "" });
  const modalRef = React.useRef(null);
  
  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  // สร้างข้อมูลกราฟ CLO ตามรายวิชาที่เลือก
  const getCLOChartData = () => {
    if (!selectedCourse || !courseData[selectedCourse]) return {
      labels: ['CLO1', 'CLO2', 'CLO3'],
      datasets: [
        {
          label: 'Completion Rate',
          data: [85, 65, 90],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
    
    const cloList = courseData[selectedCourse];
    
    return {
      labels: cloList.map(clo => clo.clo_id),
      datasets: [
        {
          label: "ผลสัมฤทธิ์ CLO (%)",
          data: cloList.map(clo => clo.percent),
          backgroundColor: cloList.map(clo => clo.passed ? "rgba(75, 192, 120, 0.8)" : "rgba(255, 99, 132, 0.8)"),
          borderColor: cloList.map(clo => clo.passed ? "rgba(75, 192, 120, 1)" : "rgba(255, 99, 132, 1)"),
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ PLO Coverage
  const getPLOCoverageChartData = () => {
    if (!studentPLOData.ploList) return {
      labels: ['PLO1', 'PLO2', 'PLO3'],
      datasets: [
        {
          label: 'Coverage',
          data: [3, 5, 2],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };
    
    const passed = studentPLOData.ploList.filter(plo => plo.passed).length;
    const notPassed = studentPLOData.ploList.length - passed;
    
    return {
      labels: ["ผ่านแล้ว", "ยังไม่ผ่าน"],
      datasets: [
        {
          label: "สัดส่วน PLO",
          data: [passed, notPassed],
          backgroundColor: [
            "rgba(75, 192, 120, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: [
            "rgba(75, 192, 120, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ PLO Per Course
  const getPLOBarChartData = () => {
    if (!studentPLOData.ploList) return {
      labels: ['PLO1', 'PLO2', 'PLO3'],
      datasets: [
        {
          label: 'Achievement (%)',
          data: [78, 60, 92],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    };
    
    return {
      labels: studentPLOData.ploList.map(plo => plo.plo_id),
      datasets: [
        {
          label: "เปอร์เซ็นต์ความสำเร็จ",
          data: studentPLOData.ploList.map(plo => plo.percent),
          backgroundColor: studentPLOData.ploList.map(plo => 
            plo.passed ? "rgba(75, 192, 120, 0.8)" : "rgba(255, 99, 132, 0.8)"
          ),
          borderColor: studentPLOData.ploList.map(plo => 
            plo.passed ? "rgba(75, 192, 120, 1)" : "rgba(255, 99, 132, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ Progress to Graduation
  const getProgressToGraduationData = () => {
    if (!studentPLOData.ploList) return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [7, 3],
          backgroundColor: ['#4BC0C0', '#FF9F40'],
        },
      ],
    };
    
    const passedPLOs = studentPLOData.ploList.filter(plo => plo.passed).length;
    const totalPLOs = studentPLOData.ploList.length;
    const percentComplete = Math.round((passedPLOs / totalPLOs) * 100);
    const percentRemaining = 100 - percentComplete;
    
    return {
      labels: [`ผ่านแล้ว ${percentComplete}%`, `ยังเหลือ ${percentRemaining}%`],
      datasets: [
        {
          label: "ความก้าวหน้าในการสำเร็จการศึกษา",
          data: [percentComplete, percentRemaining],
          backgroundColor: [
            "rgba(75, 192, 120, 0.8)",
            "rgba(220, 220, 220, 0.8)",
          ],
          borderColor: [
            "rgba(75, 192, 120, 1)",
            "rgba(220, 220, 220, 1)",
          ],
          borderWidth: 1,
          cutout: '70%',
        },
      ],
    };
  };

  useEffect(() => {
    // จำลองการดึงข้อมูลจาก API
    const fetchData = () => {
      setLoading(true);
      
      // ข้อมูลรายวิชาที่ลงทะเบียน
      const courses = [
        { id: "001", name: "การเขียนโปรแกรมเบื้องต้น" },
        { id: "002", name: "ฐานข้อมูลเบื้องต้น" },
        { id: "003", name: "เว็บเทคโนโลยี" },
        { id: "004", name: "ปัญญาประดิษฐ์" },
      ];
      
      // ข้อมูล CLO ของแต่ละรายวิชา
      const courseCLOData = {
        "001": [
          { clo_id: "CLO1", name: "เข้าใจหลักการพื้นฐาน", percent: 85, passed: true },
          { clo_id: "CLO2", name: "เขียนโปรแกรมพื้นฐานได้", percent: 72, passed: true },
          { clo_id: "CLO3", name: "แก้โจทย์ปัญหาด้วยการเขียนโปรแกรม", percent: 65, passed: false },
        ],
        "002": [
          { clo_id: "CLO1", name: "เข้าใจแนวคิดฐานข้อมูล", percent: 92, passed: true },
          { clo_id: "CLO2", name: "ออกแบบฐานข้อมูลได้", percent: 78, passed: true },
          { clo_id: "CLO3", name: "เขียน SQL ได้", percent: 88, passed: true },
        ],
        "003": [
          { clo_id: "CLO1", name: "เข้าใจโครงสร้างเว็บ", percent: 95, passed: true },
          { clo_id: "CLO2", name: "สร้างเว็บไซต์ได้", percent: 81, passed: true },
          { clo_id: "CLO3", name: "พัฒนา Frontend", percent: 75, passed: true },
          { clo_id: "CLO4", name: "พัฒนา Backend", percent: 68, passed: false },
        ],
        "004": [
          { clo_id: "CLO1", name: "เข้าใจหลักการ AI", percent: 71, passed: true },
          { clo_id: "CLO2", name: "ใช้งาน ML ได้", percent: 52, passed: false },
          { clo_id: "CLO3", name: "สร้างโมเดล AI ได้", percent: 48, passed: false },
        ],
      };
      
      // ข้อมูล PLO ทั้งหมด
      const ploData = [
        { plo_id: "PLO1", name: "คิดวิเคราะห์", percent: 85, passed: true },
        { plo_id: "PLO2", name: "แก้ปัญหา", percent: 78, passed: true },
        { plo_id: "PLO3", name: "ทำงานร่วมกัน", percent: 92, passed: true },
        { plo_id: "PLO4", name: "สื่อสาร", percent: 88, passed: true },
        { plo_id: "PLO5", name: "ใช้เทคโนโลยี", percent: 74, passed: true },
        { plo_id: "PLO6", name: "มีจริยธรรม", percent: 95, passed: true },
        { plo_id: "PLO7", name: "การเรียนรู้ตลอดชีวิต", percent: 82, passed: true },
        { plo_id: "PLO8", name: "เขียนโปรแกรม", percent: 68, passed: false },
        { plo_id: "PLO9", name: "ออกแบบระบบ", percent: 62, passed: false },
        { plo_id: "PLO10", name: "ทดสอบระบบ", percent: 55, passed: false },
        { plo_id: "PLO11", name: "ภาษาอังกฤษ", percent: 40, passed: false },
        { plo_id: "PLO12", name: "การนำเสนอ", percent: 80, passed: true },
      ];
      
      // ข้อมูล PLO แยกตามรายวิชา
      const coursePLOMatrix = {
        "001": {
          "PLO1": 80, "PLO2": 75, "PLO8": 85, "PLO9": 60, "PLO10": 55
        },
        "002": {
          "PLO1": 90, "PLO2": 85, "PLO5": 88, "PLO9": 75
        },
        "003": {
          "PLO1": 85, "PLO2": 75, "PLO4": 90, "PLO5": 92, "PLO8": 80, "PLO12": 85
        },
        "004": {
          "PLO1": 78, "PLO2": 82, "PLO5": 70, "PLO7": 85, "PLO9": 65
        }
      };
      
      setCourseList(courses);
      setCourseData(courseCLOData);
      setStudentPLOData({
        ploList: ploData,
        coursePLOMatrix: coursePLOMatrix
      });
      
      // ตั้งค่ารายวิชาเริ่มต้น
      setSelectedCourse(courses[0].id);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // สร้างตาราง Heat Map สำหรับ PLO per Course Matrix
  const renderPLOMatrix = () => {
    if (!studentPLOData.coursePLOMatrix || !courseList || courseList.length === 0) return null;
    
    // คิดข้อมูล PLO ที่มีในทุกรายวิชา
    const allPLOs = new Set();
    Object.values(studentPLOData.coursePLOMatrix).forEach(courseData => {
      Object.keys(courseData).forEach(plo => allPLOs.add(plo));
    });
    const ploArray = Array.from(allPLOs).sort();
    
    return (
      <div className="plo-matrix-container mt-4">
        <h5 className="text-center mb-3">PLO Matrix แยกตามรายวิชา</h5>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>รายวิชา</th>
                {ploArray.map(plo => (
                  <th key={plo}>{plo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseList.map(course => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  {ploArray.map(plo => {
                    const value = studentPLOData.coursePLOMatrix[course.id][plo] || 0;
                    
                    // คำนวณสีตามค่า value
                    let cellStyle = {};
                    if (value > 0) {
                      // คำนวณแค่สีเขียวถึงแดงตามค่า 0-100
                      const green = Math.floor(value * 2.55);
                      const red = Math.floor((100 - value) * 2.55);
                      cellStyle = {
                        backgroundColor: `rgba(${red}, ${green}, 100, 0.7)`,
                        color: value > 50 ? 'black' : 'white',
                        fontWeight: 'bold'
                      };
                    }
                    
                    return (
                      <td key={`${course.id}-${plo}`} style={cellStyle}>
                        {value > 0 ? `${value}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ตัวเลือกสำหรับกราฟแท่ง CLO
  const cloChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "CLO Completion per Course",
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw}% (${context.raw >= 70 ? 'ผ่าน' : 'ไม่ผ่าน'})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'ร้อยละความสำเร็จ (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Course Learning Outcomes'
        }
      }
    },
  };

  // ตัวเลือกสำหรับกราฟวงกลม PLO Coverage
  const ploCoverageOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: "PLO Coverage",
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, data) => acc + data, 0);
            const currentValue = dataset.data[context.dataIndex];
            const percentage = Math.round((currentValue / total) * 100);
            return `${context.label}: ${currentValue} PLOs (${percentage}%)`;
          }
        }
      }
    },
  };

  // ตัวเลือกสำหรับกราฟแท่ง PLO per Course
  const ploBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "PLO Achievement",
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw}% (${context.raw >= 70 ? 'ผ่าน' : 'ไม่ผ่าน'})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'ร้อยละความสำเร็จ (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Program Learning Outcomes'
        }
      }
    },
  };

  // ตัวเลือกสำหรับกราฟโดนัท Progress to Graduation
  const progressOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: "Progress to Graduation",
        font: { size: 16 }
      }
    },
  };

  // ฟังก์ชันเปิดหน้าต่างรายละเอียด PLO
  const renderProgressWithCenter = () => {
    if (!studentPLOData.ploList) return null;
    
    const passedPLOs = studentPLOData.ploList.filter(plo => plo.passed).length;
    const totalPLOs = studentPLOData.ploList.length;
    const percentComplete = Math.round((passedPLOs / totalPLOs) * 100);
    
    return (
      <div className="donut-container position-relative">
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <h2 style={{ fontSize: '24px', margin: 0 }}>{percentComplete}%</h2>
          <p style={{ fontSize: '14px', margin: 0 }}>({passedPLOs}/{totalPLOs} PLOs)</p>
        </div>
        <Doughnut data={getProgressToGraduationData()} options={progressOptions} />
      </div>
    );
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
              {t("Performance Analysis System")}
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
                {t("individual level")}
              </li>
              <li
                className={`tab-item ${activeTab === 1 ? "active" : ""}`}
                onClick={() => handleTabClick(1)}>
                {t("Course level")}
              </li>
              <li
                className={`tab-item ${activeTab === 2 ? "active" : ""}`}
                onClick={() => handleTabClick(2)}>
                {t("Program level")}
              </li>
            </ul>
 
          </div>
        </div>
  
        <div
          style={{
            paddingTop: "10px", // ต้องเพิ่ม padding ให้มากพอสำหรับความสูงของแถบเมนู
            padding: "40px 15px 0 0px",
          }}>

          <div
            className={`tab-content ${activeTab === 0 ? "active" : ""}`}
            style={{ marginTop: 10, marginBottom: 50, width: "75vw" }}>
            <h3>{t('individual level')}</h3>
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
  
            <div className="container py-4">
              <h1 className="text-center mb-4">ระบบติดตามความก้าวหน้า PLO/CLO</h1>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="mb-3">
                        <label htmlFor="courseSelect" className="form-label">เลือกรายวิชา:</label>
                        <select 
                          id="courseSelect" 
                          className="form-select"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                          {courseList.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {getCLOChartData() && (
                        <Bar data={getCLOChartData()} options={cloChartOptions} />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-5">
                          {getPLOCoverageChartData() && (
                            <Pie data={getPLOCoverageChartData()} options={ploCoverageOptions} />
                          )}
                        </div>
                        <div className="col-md-7">
                          {getPLOBarChartData() && (
                            <Bar data={getPLOBarChartData()} options={ploBarOptions} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      {renderProgressWithCenter()}
                      <div className="mt-3">
                        {studentPLOData.ploList && (
                          <>
                            <p className="mb-1">
                              <strong>จำนวน PLO ที่ผ่านแล้ว:</strong> {studentPLOData.ploList.filter(plo => plo.passed).length}/{studentPLOData.ploList.length}
                            </p>
                            <p className="mb-1">
                              <strong>เกณฑ์การสำเร็จการศึกษา:</strong> ผ่านอย่างน้อย 70% ของ PLO ทั้งหมด
                            </p>
                            <p className={`alert ${studentPLOData.ploList && studentPLOData.ploList.filter(plo => plo.passed).length >= (studentPLOData.ploList.length * 0.7) ? 'alert-success' : 'alert-warning'} mt-2 p-2`}>
                              {studentPLOData.ploList && studentPLOData.ploList.filter(plo => plo.passed).length >= (studentPLOData.ploList.length * 0.7) 
                                ? "ผ่านเกณฑ์การสำเร็จการศึกษาแล้ว" 
                                : "ยังไม่ผ่านเกณฑ์การสำเร็จการศึกษา"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-8">
                  <div className="card h-100">
                    <div className="card-body">
                      {renderPLOMatrix()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">คำแนะนำในการลงทะเบียนเรียน</h5>
                    </div>
                    <div className="card-body">
                      <p>จากผลการวิเคราะห์ PLO ที่ยังไม่ผ่าน ควรลงทะเบียนเรียนรายวิชาต่อไปนี้:</p>
                      <ul>
                        <li><strong>วิชาการทดสอบซอฟต์แวร์</strong> - เพื่อพัฒนา PLO10 (ทดสอบระบบ)</li>
                        <li><strong>วิชาภาษาอังกฤษสำหรับวิทยาการคอมพิวเตอร์</strong> - เพื่อพัฒนา PLO11 (ภาษาอังกฤษ)</li>
                        <li><strong>วิชาการสร้างและวิเคราะห์อัลกอริทึม</strong> - เพื่อพัฒนา PLO8 (เขียนโปรแกรม) และ PLO9 (ออกแบบระบบ)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <h3>{t('Course level')}</h3>
  
                <hr className="my-4" />
  
  
              </div>
            </div>
          </div>
          <div
            className={`tab-content ${activeTab === 2 ? "active" : ""}`}
            style={{ marginTop: 10, marginBottom: 50 }}>
            <div
              style={{
                backgroundColor: "#F0F0F0",
                minHeight: "0vh",
                paddingTop: "0px",
                width: "75vw",
              }}>
              <div className="student-management-container">
                <h3>{t('Program level')}</h3>
  
                <hr className="my-4" />
    
             
              </div>
            </div>

          </div>

        </div>
      </div>
    );
};

export default ViewChart;