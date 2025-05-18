import React, { useState, useEffect } from "react";
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
import { Bar, Pie, Doughnut, Radar, Line } from "react-chartjs-2";

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

function PLOCLOTrackingSystem() {
  // State สำหรับการควบคุม Tab
  const [activeTab, setActiveTab] = useState(1);
  
  // State เพื่อเก็บข้อมูลจากเซิร์ฟเวอร์
  const [courseData, setCourseData] = useState([]);
  const [studentPLOData, setStudentPLOData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(1);
  const [programList, setProgramList] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // สีธีมหลักสำหรับแอพพลิเคชัน - เทาแดง
  const theme = {
    primary: "rgb(169, 50, 38)", // สีแดงเข้ม
    secondary: "rgb(205, 97, 85)", // สีแดงอ่อน
    tertiary: "rgb(236, 112, 99)", // สีแดงสว่าง
    background: "rgb(245, 245, 245)", // สีเทาอ่อน
    backgroundDark: "rgb(220, 220, 220)", // สีเทาเข้มกว่า
    textDark: "rgb(50, 50, 50)", // สีเทาเข้มสำหรับข้อความ
    success: "rgb(80, 160, 100)", // สีเขียวสำหรับผ่าน
    warning: "rgb(230, 126, 34)", // สีส้มสำหรับคำเตือน
    danger: "rgb(192, 57, 43)", // สีแดงสำหรับไม่ผ่าน
  };

  // ตรวจสอบว่าข้อมูลโหลดเสร็จแล้ว
  useEffect(() => {
    console.log('Loading status:', loading);
    console.log('Course Data:', courseData);
    console.log('Student PLO Data:', studentPLOData);
  }, [loading, courseData, studentPLOData]);

  // จำลองข้อมูลสำหรับแสดงกราฟ (ในการใช้งานจริงควรเป็นข้อมูลจาก API)
  useEffect(() => {
    // จำลองการดึงข้อมูลจาก API
    const fetchData = () => {
      setLoading(true);
      
      // ข้อมูลรายวิชาที่ลงทะเบียน
      const courses = [
        { id: "001", name: "การเขียนโปรแกรมเบื้องต้น", engName: "Introduction to Programming", code: "261103" },
        { id: "002", name: "ฐานข้อมูลเบื้องต้น", engName: "Database Systems", code: "261336"  },
        { id: "003", name: "เว็บเทคโนโลยี", engName: "Web Technology", code: "261455"  },
        { id: "004", name: "ปัญญาประดิษฐ์", engName: "Artificial Intelligence", code: "261454"  },
      ];
      
      // รายชื่อนักศึกษา
      const students = [
        { id: "6310110001", name: "นาย ก" },
        { id: "6310110002", name: "นางสาว ข" },
        { id: "6310110003", name: "นาย ค" },
        { id: "6310110004", name: "นางสาว ง" },
      ];
      
      // รายชื่อหลักสูตร
      const programs = [
        { id: 1, name: "วิศวกรรมคอมพิวเตอร์", engName: "Computer Engineering", code: "CPE2565" },
        { id: 2, name: "วิทยาการคอมพิวเตอร์", engName: "Computer Science", code: "CSC2565" },
        { id: 3, name: "เทคโนโลยีสารสนเทศ", engName: "Information Technology", code: "IT2565" },
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
      
      // ข้อมูลการเปรียบเทียบ CLO ระหว่างนักศึกษา (สำหรับ Tab 2)
      const courseStudentCLOComparison = {
        "001": {
          "6310110001": { "CLO1": 90, "CLO2": 85, "CLO3": 75 },
          "6310110002": { "CLO1": 75, "CLO2": 68, "CLO3": 60 },
          "6310110003": { "CLO1": 85, "CLO2": 72, "CLO3": 65 },
          "6310110004": { "CLO1": 95, "CLO2": 88, "CLO3": 78 },
          "average": { "CLO1": 86.25, "CLO2": 78.25, "CLO3": 69.5 }
        },
        "002": {
          "6310110001": { "CLO1": 92, "CLO2": 88, "CLO3": 85 },
          "6310110002": { "CLO1": 80, "CLO2": 75, "CLO3": 78 },
          "6310110003": { "CLO1": 85, "CLO2": 78, "CLO3": 80 },
          "6310110004": { "CLO1": 95, "CLO2": 90, "CLO3": 92 },
          "average": { "CLO1": 88, "CLO2": 82.75, "CLO3": 83.75 }
        },
        "003": {
          "6310110001": { "CLO1": 92, "CLO2": 85, "CLO3": 78, "CLO4": 70 },
          "6310110002": { "CLO1": 88, "CLO2": 78, "CLO3": 72, "CLO4": 65 },
          "6310110003": { "CLO1": 90, "CLO2": 82, "CLO3": 75, "CLO4": 68 },
          "6310110004": { "CLO1": 95, "CLO2": 88, "CLO3": 82, "CLO4": 75 },
          "average": { "CLO1": 91.25, "CLO2": 83.25, "CLO3": 76.75, "CLO4": 69.5 }
        },
        "004": {
          "6310110001": { "CLO1": 80, "CLO2": 65, "CLO3": 60 },
          "6310110002": { "CLO1": 75, "CLO2": 58, "CLO3": 50 },
          "6310110003": { "CLO1": 65, "CLO2": 45, "CLO3": 40 },
          "6310110004": { "CLO1": 85, "CLO2": 70, "CLO3": 65 },
          "average": { "CLO1": 76.25, "CLO2": 59.5, "CLO3": 53.75 }
        }
      };
      
      // ข้อมูลแนวโน้มผลการเรียนรู้ของแต่ละรายวิชาย้อนหลัง 5 ปี (สำหรับ Tab 2)
      const courseHistoricalData = {
        "001": [
          { year: 2567, semester: 1, average: 78.5 },
          { year: 2566, semester: 2, average: 75.2 },
          { year: 2566, semester: 1, average: 76.8 },
          { year: 2565, semester: 2, average: 74.1 },
          { year: 2565, semester: 1, average: 73.5 },
          { year: 2564, semester: 2, average: 72.3 },
          { year: 2564, semester: 1, average: 71.8 },
          { year: 2563, semester: 2, average: 70.5 },
          { year: 2563, semester: 1, average: 69.2 },
        ],
        "002": [
          { year: 2567, semester: 1, average: 83.2 },
          { year: 2566, semester: 2, average: 82.5 },
          { year: 2566, semester: 1, average: 81.7 },
          { year: 2565, semester: 2, average: 80.9 },
          { year: 2565, semester: 1, average: 79.5 },
          { year: 2564, semester: 2, average: 78.8 },
          { year: 2564, semester: 1, average: 77.2 },
          { year: 2563, semester: 2, average: 76.5 },
          { year: 2563, semester: 1, average: 75.8 },
        ],
        "003": [
          { year: 2567, semester: 1, average: 81.7 },
          { year: 2566, semester: 2, average: 80.5 },
          { year: 2566, semester: 1, average: 79.8 },
          { year: 2565, semester: 2, average: 78.2 },
          { year: 2565, semester: 1, average: 77.5 },
          { year: 2564, semester: 2, average: 76.9 },
          { year: 2564, semester: 1, average: 75.5 },
          { year: 2563, semester: 2, average: 74.8 },
          { year: 2563, semester: 1, average: 73.5 },
        ],
        "004": [
          { year: 2567, semester: 1, average: 70.8 },
          { year: 2566, semester: 2, average: 68.5 },
          { year: 2566, semester: 1, average: 67.2 },
          { year: 2565, semester: 2, average: 65.8 },
          { year: 2565, semester: 1, average: 64.5 },
          { year: 2564, semester: 2, average: 63.2 },
          { year: 2564, semester: 1, average: 62.5 },
          { year: 2563, semester: 2, average: 61.8 },
          { year: 2563, semester: 1, average: 60.5 },
        ]
      };
      
      // ข้อมูลสำหรับ Tab 3 - ติดตามผลการเรียนรู้รายโปรแกรม
      const programPLOAchievement = {
        1: {
          overall: 75.8,
          passingRate: 0.68,
          byYear: [
            { year: 2563, achievement: 68.5 },
            { year: 2564, achievement: 70.2 },
            { year: 2565, achievement: 72.8 },
            { year: 2566, achievement: 74.5 },
            { year: 2567, achievement: 75.8 },
          ],
          byPLO: {
            "PLO1": 85.2, "PLO2": 82.5, "PLO3": 88.5, "PLO4": 83.7,
            "PLO5": 78.9, "PLO6": 90.2, "PLO7": 79.5, "PLO8": 68.4,
            "PLO9": 65.2, "PLO10": 60.8, "PLO11": 58.5, "PLO12": 75.8
          },
          studentProgress: [
            { studentId: "6310110001", name: "นาย ก", progress: 83.5 },
            { studentId: "6310110002", name: "นางสาว ข", progress: 72.8 },
            { studentId: "6310110003", name: "นาย ค", progress: 68.5 },
            { studentId: "6310110004", name: "นางสาว ง", progress: 85.2 },
            // สมมติข้อมูลเพิ่มเติม
            { studentId: "6310110005", name: "นาย จ", progress: 78.3 },
            { studentId: "6310110006", name: "นางสาว ฉ", progress: 70.1 },
            { studentId: "6310110007", name: "นาย ช", progress: 75.6 },
            { studentId: "6310110008", name: "นางสาว ซ", progress: 81.9 },
            { studentId: "6310110009", name: "นาย ฌ", progress: 65.7 },
            { studentId: "6310110010", name: "นางสาว ญ", progress: 79.2 }
          ],
          courseComparison: {
            "001": { contribution: 18.5, effectiveness: 75.8 },
            "002": { contribution: 22.3, effectiveness: 82.5 },
            "003": { contribution: 25.8, effectiveness: 78.9 },
            "004": { contribution: 15.5, effectiveness: 67.2 }
          }
        },
        2: {
          overall: 72.5,
          passingRate: 0.65,
          byYear: [
            { year: 2563, achievement: 65.8 },
            { year: 2564, achievement: 67.2 },
            { year: 2565, achievement: 69.5 },
            { year: 2566, achievement: 71.2 },
            { year: 2567, achievement: 72.5 },
          ],
          byPLO: {
            "PLO1": 82.5, "PLO2": 78.9, "PLO3": 85.2, "PLO4": 80.5,
            "PLO5": 75.8, "PLO6": 87.5, "PLO7": 76.2, "PLO8": 65.8,
            "PLO9": 62.5, "PLO10": 58.2, "PLO11": 55.8, "PLO12": 72.5
          }
        },
        3: {
          overall: 78.2,
          passingRate: 0.72,
          byYear: [
            { year: 2563, achievement: 70.5 },
            { year: 2564, achievement: 72.8 },
            { year: 2565, achievement: 74.5 },
            { year: 2566, achievement: 76.8 },
            { year: 2567, achievement: 78.2 },
          ],
          byPLO: {
            "PLO1": 88.5, "PLO2": 85.2, "PLO3": 90.8, "PLO4": 85.5,
            "PLO5": 82.5, "PLO6": 92.5, "PLO7": 83.8, "PLO8": 72.5,
            "PLO9": 68.5, "PLO10": 65.2, "PLO11": 62.8, "PLO12": 80.5
          }
        }
      };
      
      setCourseList(courses);
      setStudentList(students);
      setProgramList(programs);
      setCourseData(courseCLOData);
      setStudentPLOData({
        ploList: ploData,
        coursePLOMatrix: coursePLOMatrix
      });
      setAllCoursesData({
        studentCLOComparison: courseStudentCLOComparison,
        historicalData: courseHistoricalData
      });
      setProgramData(programPLOAchievement);
      
      // ตั้งค่าเริ่มต้น
      setSelectedCourse(courses[0].id);
      setSelectedStudent(students[0].id);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // === Tab 1: ติดตามผลการเรียนรู้ของนักศึกษาแต่ละคน ===
  
  // สร้างข้อมูลกราฟ CLO ตามรายวิชาที่เลือก
  const getCLOChartData = () => {
    if (!selectedCourse || !courseData[selectedCourse]) return null;
    
    const cloList = courseData[selectedCourse];
    
    return {
      labels: cloList.map(clo => clo.clo_id),
      datasets: [
        {
          label: "ผลสัมฤทธิ์ CLO (%)",
          data: cloList.map(clo => clo.percent),
          backgroundColor: cloList.map(clo => clo.passed ? theme.success : theme.danger),
          borderColor: cloList.map(clo => clo.passed ? theme.success : theme.danger),
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ PLO Coverage
  const getPLOCoverageChartData = () => {
    if (!studentPLOData.ploList) return null;
    
    const passed = studentPLOData.ploList.filter(plo => plo.passed).length;
    const notPassed = studentPLOData.ploList.length - passed;
    
    return {
      labels: ["ผ่านแล้ว", "ยังไม่ผ่าน"],
      datasets: [
        {
          label: "สัดส่วน PLO",
          data: [passed, notPassed],
          backgroundColor: [
            theme.success,
            theme.danger,
          ],
          borderColor: [
            theme.success,
            theme.danger,
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ PLO Bar Chart
  const getPLOBarChartData = () => {
    if (!studentPLOData.ploList) return null;
    
    return {
      labels: studentPLOData.ploList.map(plo => plo.plo_id),
      datasets: [
        {
          label: "เปอร์เซ็นต์ความสำเร็จ",
          data: studentPLOData.ploList.map(plo => plo.percent),
          backgroundColor: studentPLOData.ploList.map(plo => 
            plo.passed ? theme.success : theme.danger
          ),
          borderColor: studentPLOData.ploList.map(plo => 
            plo.passed ? theme.success : theme.danger
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลกราฟ Progress to Graduation
  const getProgressToGraduationData = () => {
    if (!studentPLOData.ploList) return null;
    
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
            theme.success,
            theme.backgroundDark,
          ],
          borderColor: [
            theme.success,
            theme.backgroundDark,
          ],
          borderWidth: 1,
          cutout: '70%',
        },
      ],
    };
  };

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
            <thead style={{ backgroundColor: theme.backgroundDark }}>
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
                  <td style={{ backgroundColor: theme.backgroundDark }}>{course.name}</td>
                  {ploArray.map(plo => {
                    const value = studentPLOData.coursePLOMatrix[course.id][plo] || 0;
                    
                    // คำนวณสีตามค่า value
                    let cellStyle = {};
                    if (value > 0) {
                      // ใช้สีในธีม - เขียวถึงแดง
                      const ratio = value / 100;
                      // ผสมสีระหว่างสีแดงและสีเขียว
                      const r = Math.round(192 + (80 - 192) * ratio);
                      const g = Math.round(57 + (160 - 57) * ratio);
                      const b = Math.round(43 + (100 - 43) * ratio);
                      cellStyle = {
                        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.8)`,
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

  // === Tab 2: ติดตามผลการเรียนรู้แต่ละรายวิชา ===

  // สร้างข้อมูลกราฟเปรียบเทียบ CLO ระหว่างนักศึกษาในรายวิชา
  const getStudentCLOComparisonData = () => {
    if (!selectedCourse || !allCoursesData.studentCLOComparison || !allCoursesData.studentCLOComparison[selectedCourse]) return null;
    
    const courseData = allCoursesData.studentCLOComparison[selectedCourse];
    const cloIds = Object.keys(courseData.average);
    
    // ดึงข้อมูลเฉพาะนักศึกษา (ไม่รวม average)
    const studentIds = Object.keys(courseData).filter(id => id !== "average");
    
    const datasets = studentIds.map(studentId => {
      const student = studentList.find(s => s.id === studentId);
      const studentName = student ? student.name : studentId;
      
      // สร้างสีแบบสุ่มแต่ไม่ใช้สีที่จองไว้สำหรับค่าเฉลี่ย
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      
      return {
        label: studentName,
        data: cloIds.map(cloId => courseData[studentId][cloId]),
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.6)`,
        borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
        borderWidth: 1,
      };
    });
    
    // เพิ่มค่าเฉลี่ยเป็นเส้นสุดท้าย
    datasets.push({
      label: "ค่าเฉลี่ย",
      data: cloIds.map(cloId => courseData.average[cloId]),
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      borderWidth: 2,
      type: 'line',
      fill: false,
    });
    
    return {
      labels: cloIds,
      datasets: datasets,
    };
  };

  // สร้างข้อมูลกราฟแนวโน้มผลการเรียนรู้ย้อนหลัง
  const getCourseHistoricalTrendData = () => {
    if (!selectedCourse || !allCoursesData.historicalData || !allCoursesData.historicalData[selectedCourse]) return null;
    
    const historicalData = allCoursesData.historicalData[selectedCourse];
    
    // จัดเรียงข้อมูลตามปีและภาคเรียน
    const sortedData = [...historicalData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
    
    return {
      labels: sortedData.map(item => `${item.year}/${item.semester}`),
      datasets: [
        {
          label: "ค่าเฉลี่ยผลสัมฤทธิ์ (%)",
          data: sortedData.map(item => item.average),
          backgroundColor: theme.tertiary,
          borderColor: theme.primary,
          borderWidth: 2,
          tension: 0.4,
        }
      ]
    };
  };

  // ตัวเลือกสำหรับกราฟเปรียบเทียบ CLO
  const studentCLOComparisonOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom'
      },
      title: {
        display: true,
        text: "ผลสัมฤทธิ์ CLO เปรียบเทียบระหว่างนักศึกษา",
        font: { size: 16 }
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

  // ตัวเลือกสำหรับกราฟแนวโน้ม
  const historicalTrendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "แนวโน้มผลสัมฤทธิ์รายวิชาย้อนหลัง",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        title: {
          display: true,
          text: 'ค่าเฉลี่ยผลสัมฤทธิ์ (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'ปีการศึกษา/ภาคเรียน'
        }
      }
    },
  };

  // === Tab 3: ติดตามผลการเรียนรู้รายโปรแกรม ===

  // สร้างข้อมูลกราฟแนวโน้มผลสัมฤทธิ์ของหลักสูตร
  const getProgramTrendData = () => {
    if (!selectedProgramId || !programData[selectedProgramId]) return null;
    
    const programTrend = programData[selectedProgramId].byYear;
    
    return {
      labels: programTrend.map(item => item.year),
      datasets: [
        {
          label: "ผลสัมฤทธิ์เฉลี่ย (%)",
          data: programTrend.map(item => item.achievement),
          backgroundColor: theme.tertiary,
          borderColor: theme.primary,
          borderWidth: 2,
          tension: 0.4,
        }
      ]
    };
  };

  // สร้างข้อมูลกราฟ PLO ของหลักสูตร
  const getProgramPLOChartData = () => {
    if (!selectedProgramId || !programData[selectedProgramId]) return null;
    
    const ploData = programData[selectedProgramId].byPLO;
    const ploIds = Object.keys(ploData).sort();
    
    return {
      labels: ploIds,
      datasets: [
        {
          label: "ผลสัมฤทธิ์ PLO (%)",
          data: ploIds.map(ploId => ploData[ploId]),
          backgroundColor: ploIds.map(ploId => ploData[ploId] >= 70 ? theme.success : theme.danger),
          borderColor: ploIds.map(ploId => ploData[ploId] >= 70 ? theme.success : theme.danger),
          borderWidth: 1,
        }
      ]
    };
  };

  // สร้างข้อมูลกราฟแสดงความสำเร็จของหลักสูตร
  const getProgramSuccessData = () => {
    if (!selectedProgramId || !programData[selectedProgramId]) return null;
    
    const passingRate = programData[selectedProgramId].passingRate;
    
    return {
      labels: ["ผ่านเกณฑ์", "ไม่ผ่านเกณฑ์"],
      datasets: [
        {
          label: "สัดส่วนความสำเร็จของหลักสูตร",
          data: [passingRate * 100, (1 - passingRate) * 100],
          backgroundColor: [
            theme.success,
            theme.danger,
          ],
          borderColor: [
            theme.success,
            theme.danger,
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // สร้างข้อมูลกราฟประสิทธิภาพรายวิชาในหลักสูตร
  const getCourseEffectivenessData = () => {
    if (!selectedProgramId || !programData[selectedProgramId] || !programData[selectedProgramId].courseComparison) return null;
    
    const courseComparison = programData[selectedProgramId].courseComparison;
    const courseIds = Object.keys(courseComparison);
    
    const courseNames = courseIds.map(id => {
      const course = courseList.find(c => c.id === id);
      return course ? course.name : id;
    });
    
    return {
      labels: courseNames,
      datasets: [
        {
          label: "การมีส่วนร่วม (%)",
          data: courseIds.map(id => courseComparison[id].contribution),
          backgroundColor: theme.secondary,
          borderColor: theme.primary,
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: "ประสิทธิภาพ (%)",
          data: courseIds.map(id => courseComparison[id].effectiveness),
          backgroundColor: theme.success,
          borderColor: theme.success,
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1',
        }
      ]
    };
  };

  // ตัวเลือกสำหรับกราฟรายโปรแกรม
  const programTrendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "แนวโน้มผลสัมฤทธิ์ของหลักสูตร",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        title: {
          display: true,
          text: 'ผลสัมฤทธิ์เฉลี่ย (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'ปีการศึกษา'
        }
      }
    },
  };

  const programPLOOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "ผลสัมฤทธิ์รายด้าน PLO",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'ผลสัมฤทธิ์ (%)'
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

  const programSuccessOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: "สัดส่วนความสำเร็จของหลักสูตร",
        font: { size: 16 }
      }
    },
  };

  const courseEffectivenessOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: "ประสิทธิภาพรายวิชาในหลักสูตร",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        display: true,
        position: 'left',
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'การมีส่วนร่วม (%)'
        }
      },
      y1: {
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'ประสิทธิภาพ (%)'
        }
      },
    },
  };

  // สร้างตารางรายชื่อนักศึกษาและความก้าวหน้า
  const renderStudentProgressTable = () => {
    if (!selectedProgramId || !programData[selectedProgramId] || !programData[selectedProgramId].studentProgress) return null;
    
    const studentProgress = programData[selectedProgramId].studentProgress;
    
    return (
      <div className="table-responsive mt-4">
        <table className="table table-striped table-hover">
          <thead style={{ backgroundColor: theme.backgroundDark }}>
            <tr>
              <th>รหัสนักศึกษา</th>
              <th>ชื่อ-สกุล</th>
              <th>ความก้าวหน้า (%)</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {studentProgress.map(student => (
              <tr key={student.studentId}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>
                  <div className="progress">
                    <div 
                      className={`progress-bar ${student.progress >= 70 ? 'bg-success' : 'bg-danger'}`}
                      role="progressbar" 
                      style={{ width: `${student.progress}%` }}
                      aria-valuenow={student.progress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {student.progress}%
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${student.progress >= 70 ? 'bg-success' : 'bg-danger'}`}>
                    {student.progress >= 70 ? 'ผ่าน' : 'ไม่ผ่าน'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: theme.background }}>
        <div className="spinner-border" role="status" style={{ color: theme.primary }}>
          <span className="visually-hidden">กำลังโหลดข้อมูล...</span>
        </div>
        <span className="ms-2" style={{ color: theme.textDark }}>กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // ฟังก์ชันช่วย - แปลรหัส PLO เป็นคำอธิบาย
  function ploDescription(ploId) {
    const descriptions = {
      "PLO1": "คิดวิเคราะห์",
      "PLO2": "แก้ปัญหา",
      "PLO3": "ทำงานร่วมกัน",
      "PLO4": "สื่อสาร",
      "PLO5": "ใช้เทคโนโลยี",
      "PLO6": "มีจริยธรรม",
      "PLO7": "การเรียนรู้ตลอดชีวิต",
      "PLO8": "เขียนโปรแกรม",
      "PLO9": "ออกแบบระบบ",
      "PLO10": "ทดสอบระบบ",
      "PLO11": "ภาษาอังกฤษ",
      "PLO12": "การนำเสนอ",
    };
    
    return descriptions[ploId] || ploId;
  }

  // สร้าง Sidebar Menu Items
  const sidebarItems = [
    { id: 'dashboard', title: 'Dashboard', icon: 'bi bi-speedometer2' },
    { id: 'students', title: 'จัดการนักศึกษา', icon: 'bi bi-people' },
    { id: 'programs', title: 'จัดการหลักสูตร', icon: 'bi bi-journal-text' },
    { id: 'courses', title: 'จัดการรายวิชา', icon: 'bi bi-book' },
    { id: 'plo', title: 'จัดการ PLO', icon: 'bi bi-list-check' },
    { id: 'clo', title: 'จัดการ CLO', icon: 'bi bi-check2-square' },
    { id: 'tracking', title: 'ติดตามผลการเรียนรู้', icon: 'bi bi-graph-up' },
    { id: 'reports', title: 'รายงาน', icon: 'bi bi-file-earmark-bar-graph' },
    { id: 'settings', title: 'ตั้งค่าระบบ', icon: 'bi bi-gear' },
  ];

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isSidebarCollapsed ? '60px' : '250px',
          minHeight: '100vh',
          backgroundColor: '#343a40',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          transition: 'width 0.3s ease-in-out',
          zIndex: 1000,
          overflowY: 'auto'
        }}
      >
        <div className="py-3 px-3 d-flex align-items-center justify-content-between">
          {!isSidebarCollapsed && (
            <h5 className="m-0 text-white" style={{ fontSize: '1.2rem' }}>PLO/CLO System</h5>
          )}
          <button 
            className="btn btn-link text-white p-0" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ fontSize: '1.2rem' }}
          >
            <i className={`bi ${isSidebarCollapsed ? 'bi-arrow-right-square' : 'bi-arrow-left-square'}`}></i>
          </button>
        </div>
        
        <hr className="border-secondary my-1" />
        
        <ul className="nav flex-column px-0">
          {sidebarItems.map(item => (
            <li className="nav-item" key={item.id}>
              <a 
                href="#" 
                className={`nav-link py-2 ${item.id === 'tracking' ? 'active' : 'text-white-50'}`}
                style={{ 
                  backgroundColor: item.id === 'tracking' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  padding: isSidebarCollapsed ? '10px 12px' : '8px 16px'
                }}
              >
                <i className={`${item.icon} ${isSidebarCollapsed ? 'fs-5' : 'me-2'}`}></i>
                {!isSidebarCollapsed && <span>{item.title}</span>}
              </a>
            </li>
          ))}
        </ul>
        
        <hr className="border-secondary my-2" />
        
        <div className="px-3 pb-3">
          {!isSidebarCollapsed && (
            <div className="text-white-50 small">
              <p className="mb-1">ผู้ใช้: อาจารย์พิเชษฐ์</p>
              <p className="mb-1">สถานะ: ผู้ดูแลระบบ</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="main-content" 
        style={{ 
          marginLeft: isSidebarCollapsed ? '60px' : '250px',
          width: `calc(100% - ${isSidebarCollapsed ? '60px' : '250px'})`,
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <div 
          className="header py-3 px-4 bg-white shadow-sm"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <h3 className="mb-0">ระบบติดตามความก้าวหน้า PLO/CLO</h3>
          
          {/* Tab Navigation */}
          <ul className="nav nav-tabs mt-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 1 ? 'active' : ''}`} 
                style={{ 
                  color: activeTab === 1 ? theme.primary : theme.textDark,
                  backgroundColor: activeTab === 1 ? theme.backgroundDark : 'transparent',
                  fontWeight: activeTab === 1 ? 'bold' : 'normal',
                  borderBottom: activeTab === 1 ? `2px solid ${theme.primary}` : '',
                }}
                onClick={() => setActiveTab(1)}
              >
                1. ติดตามผลการเรียนรู้รายนักศึกษา
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
                style={{ 
                  color: activeTab === 2 ? theme.primary : theme.textDark,
                  backgroundColor: activeTab === 2 ? theme.backgroundDark : 'transparent',
                  fontWeight: activeTab === 2 ? 'bold' : 'normal',
                  borderBottom: activeTab === 2 ? `2px solid ${theme.primary}` : '',
                }}
                onClick={() => setActiveTab(2)}
              >
                2. ติดตามผลการเรียนรู้รายวิชา
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 3 ? 'active' : ''}`}
                style={{ 
                  color: activeTab === 3 ? theme.primary : theme.textDark,
                  backgroundColor: activeTab === 3 ? theme.backgroundDark : 'transparent',
                  fontWeight: activeTab === 3 ? 'bold' : 'normal',
                  borderBottom: activeTab === 3 ? `2px solid ${theme.primary}` : '',
                }}
                onClick={() => setActiveTab(3)}
              >
                3. ติดตามผลการเรียนรู้รายโปรแกรม
              </button>
            </li>
          </ul>
        </div>

        {/* Main Container */}
        <div className="container-fluid py-4" style={{ backgroundColor: theme.background }}>
          {/* Tab 1: ติดตามผลการเรียนรู้รายนักศึกษา */}
          {activeTab === 1 && (
            <div className="tab-content">
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">ข้อมูลนักศึกษา</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label htmlFor="studentSelect" className="form-label">เลือกนักศึกษา:</label>
                        <select 
                          id="studentSelect" 
                          className="form-select"
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          style={{ borderColor: theme.primary }}
                        >
                          {studentList.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.id} - {student.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="courseSelect" className="form-label">เลือกรายวิชา:</label>
                        <select 
                          id="courseSelect" 
                          className="form-select"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          style={{ borderColor: theme.primary }}
                        >
                          {courseList.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <hr />
                      {getCLOChartData() && (
                        <Bar data={getCLOChartData()} options={cloChartOptions} />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">ภาพรวมผลการเรียนรู้ระดับโปรแกรม (PLO)</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-5 mb-3">
                          {getPLOCoverageChartData() && (
                            <Pie data={getPLOCoverageChartData()} options={ploCoverageOptions} />
                          )}
                        </div>
                        <div className="col-md-7 mb-3">
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
                <div className="col-md-4 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">ความก้าวหน้าในการสำเร็จการศึกษา</h5>
                    </div>
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
                            <p className={`alert ${studentPLOData.ploList.filter(plo => plo.passed).length >= studentPLOData.ploList.length * 0.7 ? 'alert-success' : 'alert-warning'} mt-2 p-2`} style={{ backgroundColor: studentPLOData.ploList.filter(plo => plo.passed).length >= studentPLOData.ploList.length * 0.7 ? theme.success : theme.warning, color: 'white' }}>
                              {studentPLOData.ploList.filter(plo => plo.passed).length >= studentPLOData.ploList.length * 0.7 
                                ? "ผ่านเกณฑ์การสำเร็จการศึกษาแล้ว" 
                                : "ยังไม่ผ่านเกณฑ์การสำเร็จการศึกษา"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-8 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">PLO Matrix แยกตามรายวิชา</h5>
                    </div>
                    <div className="card-body">
                      {renderPLOMatrix()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
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
          )}
          
          {/* Tab 2: ติดตามผลการเรียนรู้รายวิชา */}
          {activeTab === 2 && (
            <div className="tab-content">
              <div className="row mb-4">
                <div className="col-12 mb-3">
                  <div className="card shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">ข้อมูลรายวิชา</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="courseSelectTab2" className="form-label">เลือกรายวิชา:</label>
                          <select 
                            id="courseSelectTab2" 
                            className="form-select"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{ borderColor: theme.primary }}
                          >
                            {courseList.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-8 mb-3">
                          {selectedCourse && courseList && (
                            <div className="d-flex h-100 align-items-center">
                              <div className="card w-100 border-0 bg-light">
                                <div className="card-body">
                                  <h5 className="card-title">{courseList.find(c => c.id === selectedCourse)?.code} - {courseList.find(c => c.id === selectedCourse)?.name}</h5>
                                  <h6 className="card-subtitle mb-2 text-muted">{courseList.find(c => c.id === selectedCourse)?.engName}</h6>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-7 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">เปรียบเทียบผลสัมฤทธิ์ CLO ในรายวิชา</h5>
                    </div>
                    <div className="card-body">
                      {getStudentCLOComparisonData() && (
                        <Bar data={getStudentCLOComparisonData()} options={studentCLOComparisonOptions} />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-5 mb-3">
                  <div className="card h-100 shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">แนวโน้มผลสัมฤทธิ์ของรายวิชา</h5>
                    </div>
                    <div className="card-body">
                      {getCourseHistoricalTrendData() && (
                        <Line data={getCourseHistoricalTrendData()} options={historicalTrendOptions} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-12 mb-3">
                  <div className="card shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">รายละเอียด CLO และ Assignment</h5>
                    </div>
                    <div className="card-body">
                      {selectedCourse && courseData[selectedCourse] && (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover">
                            <thead style={{ backgroundColor: theme.backgroundDark }}>
                              <tr>
                                <th style={{ width: '10%' }}>CLO ID</th>
                                <th style={{ width: '40%' }}>คำอธิบาย CLO</th>
                                <th style={{ width: '15%' }}>สถานะ</th>
                                <th style={{ width: '15%' }}>ผลสัมฤทธิ์</th>
                                <th style={{ width: '20%' }}>Assignment ที่เกี่ยวข้อง</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courseData[selectedCourse].map((clo, index) => {
                                // สร้างข้อมูล Assignment จำลอง
                                const mockAssignments = [
                                  { name: `Assignment ${index + 1}`, score: Math.round(clo.percent * 0.4) },
                                  { name: `Quiz ${index + 1}`, score: Math.round(clo.percent * 0.2) },
                                  { name: index % 2 === 0 ? `Midterm (Part ${index + 1})` : `Final (Part ${index + 1})`, score: Math.round(clo.percent * 0.4) }
                                ];
                                
                                return (
                                  <tr key={clo.clo_id}>
                                    <td>{clo.clo_id}</td>
                                    <td>{clo.name}</td>
                                    <td>
                                      <span className={`badge ${clo.passed ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: clo.passed ? theme.success : theme.danger }}>
                                        {clo.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="progress">
                                        <div 
                                          className={`progress-bar ${clo.passed ? 'bg-success' : 'bg-danger'}`}
                                          role="progressbar" 
                                          style={{ 
                                            width: `${clo.percent}%`,
                                            backgroundColor: clo.passed ? theme.success : theme.danger
                                          }}
                                          aria-valuenow={clo.percent} 
                                          aria-valuemin="0" 
                                          aria-valuemax="100"
                                        >
                                          {clo.percent}%
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <ul className="list-unstyled mb-0">
                                        {mockAssignments.map((assignment, i) => (
                                          <li key={i} className="mb-1">
                                            <small>{assignment.name}: <span className="fw-bold">{assignment.score}%</span></small>
                                          </li>
                                        ))}
                                      </ul>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card shadow-sm" style={{ borderColor: theme.backgroundDark }}>
                    <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
                      <h5 className="mb-0">วิเคราะห์และแนวทางการปรับปรุงรายวิชา</h5>
                    </div>
                    <div className="card-body">
                      {selectedCourse && courseData[selectedCourse] && (
                        <div>
                          <h6 className="mb-3">สรุปผลการวิเคราะห์</h6>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="card bg-light mb-3">
                                <div className="card-body">
                                  <h6 className="card-title">จุดแข็งของหลักสูตร</h6>
                                  <ul>
                                    {Object.entries(programData[selectedProgramId].byPLO)
                                      .filter(([_, value]) => value >= 80)
                                      .sort(([_, a], [__, b]) => b - a)
                                      .slice(0, 5)
                                      .map(([ploId, value]) => (
                                        <li key={ploId}>{ploId}: {ploDescription(ploId)} ({value.toFixed(1)}%)</li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="card bg-light mb-3">
                                <div className="card-body">
                                  <h6 className="card-title">จุดที่ควรปรับปรุง</h6>
                                  <ul>
                                    {Object.entries(programData[selectedProgramId].byPLO)
                                      .filter(([_, value]) => value < 70)
                                      .sort(([_, a], [__, b]) => a - b)
                                      .map(([ploId, value]) => (
                                        <li key={ploId}>{ploId}: {ploDescription(ploId)} ({value.toFixed(1)}%)</li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <h6 className="mb-3 mt-4">แผนการปรับปรุงหลักสูตร</h6>
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead style={{ backgroundColor: theme.backgroundDark }}>
                                <tr>
                                  <th style={{ width: '15%' }}>ด้านที่ต้องปรับปรุง</th>
                                  <th style={{ width: '35%' }}>แนวทางการปรับปรุง</th>
                                  <th style={{ width: '25%' }}>รายวิชาที่เกี่ยวข้อง</th>
                                  <th style={{ width: '25%' }}>ตัวชี้วัดความสำเร็จ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(programData[selectedProgramId].byPLO)
                                  .filter(([_, value]) => value < 70)
                                  .map(([ploId, value]) => {
                                    // สร้างข้อมูลจำลองสำหรับแนวทางการปรับปรุง
                                    let improvement = "";
                                    let relatedCourses = [];
                                    let keyPerformanceIndicators = "";
                                    
                                    if (ploId === "PLO8") {
                                      improvement = "1. ปรับปรุงเนื้อหารายวิชาด้านการเขียนโปรแกรมให้ทันสมัย\n2. เพิ่มโครงงานย่อยที่เน้นการพัฒนาทักษะการเขียนโปรแกรม\n3. จัดกิจกรรมเสริมหลักสูตรด้านการแข่งขันเขียนโปรแกรม";
                                      relatedCourses = ["การเขียนโปรแกรมเบื้องต้น", "เว็บเทคโนโลยี", "การสร้างและวิเคราะห์อัลกอริทึม"];
                                      keyPerformanceIndicators = "1. คะแนน CLO ด้านการเขียนโปรแกรมเพิ่มขึ้น 10%\n2. จำนวนนักศึกษาที่สร้างผลงานด้านการพัฒนาซอฟต์แวร์เพิ่มขึ้น";
                                    } else if (ploId === "PLO9") {
                                      improvement = "1. เพิ่มกรณีศึกษาการออกแบบระบบจากโจทย์จริง\n2. ปรับรูปแบบการเรียนการสอนให้เน้นการทำโครงงานกลุ่ม\n3. เชิญผู้เชี่ยวชาญด้านการออกแบบระบบมาบรรยายพิเศษ";
                                      relatedCourses = ["ฐานข้อมูลเบื้องต้น", "การวิเคราะห์และออกแบบระบบ", "วิศวกรรมซอฟต์แวร์"];
                                      keyPerformanceIndicators = "1. ผลประเมินโครงงานด้านการออกแบบระบบเพิ่มขึ้น 15%\n2. จำนวนนักศึกษาที่ผ่านการประเมินด้านการออกแบบระบบเพิ่มขึ้น";
                                    } else if (ploId === "PLO10") {
                                      improvement = "1. ปรับปรุงเนื้อหารายวิชาการทดสอบซอฟต์แวร์\n2. เพิ่มหัวข้อและปฏิบัติการด้านการทดสอบในรายวิชาที่เกี่ยวข้อง\n3. จัดอบรมเชิงปฏิบัติการด้านการทดสอบซอฟต์แวร์สมัยใหม่";
                                      relatedCourses = ["การเขียนโปรแกรมเบื้องต้น", "ปัญญาประดิษฐ์", "การทดสอบซอฟต์แวร์"];
                                      keyPerformanceIndicators = "1. คะแนน CLO ด้านการทดสอบเพิ่มขึ้น 15%\n2. จำนวนโครงงานที่มีแผนการทดสอบที่มีคุณภาพเพิ่มขึ้น";
                                    } else if (ploId === "PLO11") {
                                      improvement = "1. เพิ่มเอกสารประกอบการสอนภาษาอังกฤษในทุกรายวิชาหลัก\n2. จัดกิจกรรมเสริมทักษะภาษาอังกฤษเฉพาะทาง\n3. ส่งเสริมให้นักศึกษานำเสนอผลงานเป็นภาษาอังกฤษ";
                                      relatedCourses = ["ภาษาอังกฤษสำหรับวิทยาการคอมพิวเตอร์", "การนำเสนอทางวิชาการ", "วิชาโครงงาน"];
                                      keyPerformanceIndicators = "1. คะแนนภาษาอังกฤษเฉลี่ยเพิ่มขึ้น 20%\n2. จำนวนนักศึกษาที่สามารถนำเสนอผลงานเป็นภาษาอังกฤษได้เพิ่มขึ้น";
                                    } else {
                                      improvement = "1. ปรับปรุงเนื้อหาและกิจกรรมการเรียนการสอน\n2. เพิ่มกิจกรรมเสริมทักษะนอกหลักสูตร\n3. พัฒนาศักยภาพอาจารย์ผู้สอนในด้านนี้";
                                      relatedCourses = ["วิชาพื้นฐาน", "วิชาเฉพาะสาขา", "วิชาเลือก"];
                                      keyPerformanceIndicators = "1. ผลการประเมินเพิ่มขึ้น 15%\n2. จำนวนนักศึกษาที่ผ่านเกณฑ์เพิ่มขึ้น";
                                    }
                                    
                                    return (
                                      <tr key={ploId}>
                                        <td>{ploId}: {ploDescription(ploId)}</td>
                                        <td>
                                          {improvement.split('\n').map((item, i) => (
                                            <p key={i} className="mb-1">{item}</p>
                                          ))}
                                        </td>
                                        <td>
                                          <ul className="mb-0">
                                            {relatedCourses.map((course, i) => (
                                              <li key={i}>{course}</li>
                                            ))}
                                          </ul>
                                        </td>
                                        <td>
                                          {keyPerformanceIndicators.split('\n').map((item, i) => (
                                            <p key={i} className="mb-1">{item}</p>
                                          ))}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PLOCLOTrackingSystem;ข็ง</h6>
                                  <ul>
                                    {courseData[selectedCourse]
                                      .filter(clo => clo.percent >= 80)
                                      .map(clo => (
                                        <li key={clo.clo_id}>{clo.clo_id}: {clo.name} ({clo.percent}%)</li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="card bg-light mb-3">
                                <div className="card-body">
                                  <h6 className="card-title">จุดที่ควรปรับปรุง</h6>
                                  <ul>
                                    {courseData[selectedCourse]
                                      .filter(clo => clo.percent < 70)
                                      .map(clo => (
                                        <li key={clo.clo_id}>{clo.clo_id}: {clo.name} ({clo.percent}%)</li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <h6 className="mb-3 mt-4">แนวทางการปรับปรุง</h6>
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead style={{ backgroundColor: theme.backgroundDark }}>
                                <tr>
                                  <th style={{ width: '15%' }}>CLO ID</th>
                                  <th style={{ width: '35%' }}>ปัญหาที่พบ</th>
                                  <th style={{ width: '50%' }}>แนวทางการปรับปรุง</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courseData[selectedCourse]
                                  .filter(clo => clo.percent < 70)
                                  .map(clo => {
                                    // สร้างข้อมูลจำลองสำหรับแนวทางการปรับปรุง
                                    let problem = "";
                                    let improvement = "";
                                    
                                    if (clo.clo_id === "CLO2" && selectedCourse === "004") {
                                      problem = "นักศึกษาขาดความเข้าใจพื้นฐานในการใช้งาน Machine Learning Library";
                                      improvement = "1. เพิ่มคาบปฏิบัติการแบบเข้มข้น (Workshop)\n2. เพิ่มโจทย์ที่มีการแก้ไขตัวอย่างแบบทีละขั้นตอน\n3. จัดทำแบบฝึกหัดแบบโครงงานย่อยที่สามารถเห็นผลได้เร็ว";
                                    } else if (clo.clo_id === "CLO3" && selectedCourse === "004") {
                                      problem = "นักศึกษาไม่สามารถออกแบบและสร้างโมเดล AI ได้ด้วยตนเอง";
                                      improvement = "1. ปรับการสอนให้เน้นการสร้างโมเดลแบบพื้นฐานก่อน\n2. เพิ่มกรณีศึกษาที่เริ่มจากง่ายไปยาก\n3. นำเครื่องมือสร้างแบบอัตโนมัติมาช่วยสอนในระยะแรก";
                                    } else if (clo.clo_id === "CLO3" && selectedCourse === "001") {
                                      problem = "นักศึกษาแก้โจทย์ปัญหาที่ซับซ้อนไม่ได้";
                                      improvement = "1. เพิ่มตัวอย่างการแก้โจทย์ปัญหา step-by-step\n2. จัดกลุ่มนักศึกษาให้ช่วยกันแก้โจทย์ปัญหา\n3. สร้างโจทย์ที่มีความยากเพิ่มขึ้นทีละระดับ";
                                    } else if (clo.clo_id === "CLO4" && selectedCourse === "003") {
                                      problem = "นักศึกษาขาดความเข้าใจในการพัฒนา Backend";
                                      improvement = "1. เพิ่มเนื้อหาพื้นฐานด้าน Database และ API\n2. จัดทำตัวอย่างโปรเจคขนาดเล็กที่ครอบคลุมฟังก์ชันพื้นฐาน\n3. ให้นักศึกษาได้ทดลองใช้เครื่องมือสร้าง API แบบอัตโนมัติ";
                                    } else {
                                      problem = "นักศึกษาไม่สามารถนำความรู้ไปประยุกต์ใช้ได้จริง";
                                      improvement = "1. เพิ่มกรณีศึกษาจากโจทย์จริง\n2. จัดทำโครงงานย่อยที่เชื่อมโยงกับสถานการณ์จริง\n3. เชิญวิทยากรมาแชร์ประสบการณ์การใช้งานจริง";
                                    }
                                    
                                    return (
                                      <tr key={clo.clo_id}>
                                        <td>{clo.clo_id}</td>
                                        <td>{problem}</td>
                                        <td>
                                          {improvement.split('\n').map((item, i) => (
                                            <p key={i} className="mb-1">{item}</p>
                                          ))}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
          