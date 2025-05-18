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
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";

// ลงทะเบียน Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function CourseAnalysis({ studentId, programId }) {
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const { t } = useTranslation();

  // API calls
useEffect(() => {
  const fetchCourses = async () => {
    try {
      // ดึงรายวิชาของหลักสูตร
      const response = await axios.get(`/api/programs/${programId}/courses`);
      
      // ตรวจสอบว่า response.data เป็นอาร์เรย์หรือไม่
      if (response.data && Array.isArray(response.data)) {
        setCourseList(response.data);
        
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id);
        }
      } else {
        console.error("API response is not an array:", response.data);
        // กำหนดค่าเป็นอาร์เรย์ว่าง
        setCourseList([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setLoading(false);
      
      // Fallback ใช้ข้อมูลจำลองเมื่อเรียก API ไม่สำเร็จ
      const mockCourses = [
        { id: "001", name: "การเขียนโปรแกรมเบื้องต้น" },
        { id: "002", name: "ฐานข้อมูลเบื้องต้น" },
        { id: "003", name: "เว็บเทคโนโลยี" },
        { id: "004", name: "ปัญญาประดิษฐ์" },
      ];
      setCourseList(mockCourses);
      setSelectedCourse(mockCourses[0].id);
    }
  };

  fetchCourses();
}, [programId]);


  // เมื่อเลือกรายวิชา ให้ดึงข้อมูลวิเคราะห์ของวิชานั้น
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchCourseAnalysis = async () => {
      setLoading(true);
      try {
        // ดึงข้อมูลการวิเคราะห์รายวิชาจาก API
        const response = await axios.get(`/api/chart/course-analysis?programCourseId=${selectedCourse}`);
        setCourseData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course analysis:", error);
        setLoading(false);
        
        // Fallback ใช้ข้อมูลจำลองเมื่อเรียก API ไม่สำเร็จ
        const mockCourseData = {
          program_course_id: selectedCourse,
          clo_summary: [
            { clo_id: "CLO1", clo_code: "CLO1", description: "เข้าใจหลักการพื้นฐาน", total_students: 35, avg_achievement: 82.5, passed_students: 30, passing_rate: 85.71 },
            { clo_id: "CLO2", clo_code: "CLO2", description: "ประยุกต์ใช้หลักการได้", total_students: 35, avg_achievement: 75.3, passed_students: 26, passing_rate: 74.29 },
            { clo_id: "CLO3", clo_code: "CLO3", description: "วิเคราะห์และแก้ปัญหาได้", total_students: 35, avg_achievement: 68.7, passed_students: 22, passing_rate: 62.86 },
          ],
          clo_distribution: [
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "0-49", student_count: 1 },
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "50-59", student_count: 2 },
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "60-69", student_count: 2 },
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "70-79", student_count: 10 },
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "80-89", student_count: 15 },
            { clo_id: "CLO1", clo_code: "CLO1", score_range: "90-100", student_count: 5 },
            
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "0-49", student_count: 2 },
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "50-59", student_count: 3 },
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "60-69", student_count: 4 },
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "70-79", student_count: 11 },
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "80-89", student_count: 10 },
            { clo_id: "CLO2", clo_code: "CLO2", score_range: "90-100", student_count: 5 },
            
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "0-49", student_count: 4 },
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "50-59", student_count: 5 },
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "60-69", student_count: 4 },
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "70-79", student_count: 12 },
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "80-89", student_count: 8 },
            { clo_id: "CLO3", clo_code: "CLO3", score_range: "90-100", student_count: 2 },
          ]
        };
        
        setCourseData(mockCourseData);
      }
    };

    fetchCourseAnalysis();
  }, [selectedCourse]);

  // สร้างข้อมูลสำหรับแสดงกราฟ CLO Achievement
  const getCloAchievementChartData = () => {
    if (!courseData) return null;
    
    return {
      labels: courseData.clo_summary.map(clo => `${clo.clo_code}`),
      datasets: [
        {
          label: "ร้อยละความสำเร็จเฉลี่ย",
          data: courseData.clo_summary.map(clo => clo.avg_achievement),
          backgroundColor: courseData.clo_summary.map(clo => 
            clo.avg_achievement >= 70 ? "rgba(75, 192, 120, 0.8)" : "rgba(255, 99, 132, 0.8)"
          ),
          borderColor: courseData.clo_summary.map(clo => 
            clo.avg_achievement >= 70 ? "rgba(75, 192, 120, 1)" : "rgba(255, 99, 132, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลสำหรับแสดงกราฟ CLO Passing Rate 
  const getCloPassingRateChartData = () => {
    if (!courseData) return null;
    
    return {
      labels: courseData.clo_summary.map(clo => `${clo.clo_code}`),
      datasets: [
        {
          label: "อัตราการผ่าน (%)",
          data: courseData.clo_summary.map(clo => clo.passing_rate),
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // สร้างข้อมูลสำหรับแสดงกราฟการกระจายคะแนนของ CLO ที่เลือก
  const getCloDistributionChartData = (cloId) => {
    if (!courseData) return null;
    
    const distributionData = courseData.clo_distribution.filter(item => item.clo_id === cloId);
    const scoreRanges = ["0-49", "50-59", "60-69", "70-79", "80-89", "90-100"];
    
    // จัดเรียงข้อมูลตามช่วงคะแนน
    const sortedData = scoreRanges.map(range => {
      const found = distributionData.find(item => item.score_range === range);
      return found ? found.student_count : 0;
    });
    
    return {
      labels: scoreRanges,
      datasets: [
        {
          label: "จำนวนนักศึกษา",
          data: sortedData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",  // 0-49
            "rgba(255, 159, 64, 0.8)",  // 50-59
            "rgba(255, 205, 86, 0.8)",  // 60-69
            "rgba(75, 192, 120, 0.8)",  // 70-79
            "rgba(54, 162, 235, 0.8)",  // 80-89
            "rgba(153, 102, 255, 0.8)"  // 90-100
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 120, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)"
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // ตัวเลือกสำหรับกราฟแท่ง CLO Achievement
  const cloAchievementOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "ร้อยละความสำเร็จเฉลี่ยของแต่ละ CLO",
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

  // ตัวเลือกสำหรับกราฟแท่ง CLO Passing Rate
  const cloPassingRateOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "อัตราการผ่านของแต่ละ CLO",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'อัตราการผ่าน (%)'
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

  // ตัวเลือกสำหรับกราฟแท่งการกระจายคะแนน
  const distributionOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "การกระจายคะแนนของนักศึกษา",
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'จำนวนนักศึกษา (คน)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'ช่วงคะแนน (%)'
        }
      }
    },
  };

  return (
    <div className="container py-4">
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div>
          {/* เลือกรายวิชา */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="courseSelect" className="form-label">เลือกรายวิชา:</label>
                <select 
                  id="courseSelect" 
                  className="form-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={loading}
                >
                 {Array.isArray(courseList) ? courseList.map(course => (
  <option key={course.id} value={course.id}>
    {course.name}
  </option>
)) : null}
                 
                </select>
              </div>
            </div>
          </div>
          
          {courseData && (
            <>
              {/* ส่วนแสดงภาพรวมการบรรลุ CLO */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">ร้อยละความสำเร็จเฉลี่ยของแต่ละ CLO</h5>
                    </div>
                    <div className="card-body">
                      <Bar data={getCloAchievementChartData()} options={cloAchievementOptions} />
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">อัตราการผ่านของแต่ละ CLO</h5>
                    </div>
                    <div className="card-body">
                      <Bar data={getCloPassingRateChartData()} options={cloPassingRateOptions} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ส่วนแสดงตารางข้อมูลสรุป */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">ตารางสรุปผลการบรรลุ CLO</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>CLO</th>
                          <th>คำอธิบาย</th>
                          <th>จำนวนนักศึกษาทั้งหมด</th>
                          <th>ร้อยละความสำเร็จเฉลี่ย</th>
                          <th>จำนวนนักศึกษาที่ผ่าน</th>
                          <th>อัตราการผ่าน (%)</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseData.clo_summary.map(clo => (
                          <tr key={clo.clo_id}>
                            <td>{clo.clo_code}</td>
                            <td>{clo.description}</td>
                            <td className="text-center">{clo.total_students}</td>
                            <td className="text-center">{clo.avg_achievement}%</td>
                            <td className="text-center">{clo.passed_students}</td>
                            <td className="text-center">{clo.passing_rate}%</td>
                            <td className="text-center">
                              <span className={`badge ${clo.avg_achievement >= 70 ? 'bg-success' : 'bg-danger'}`}>
                                {clo.avg_achievement >= 70 ? 'ผ่าน' : 'ไม่ผ่าน'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* ส่วนแสดงการกระจายคะแนนของแต่ละ CLO */}
              <div className="row">
                {courseData.clo_summary.map(clo => (
                  <div className="col-md-4 mb-4" key={clo.clo_id}>
                    <div className="card h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">การกระจายคะแนน {clo.clo_code}</h5>
                      </div>
                      <div className="card-body">
                        <Bar 
                          data={getCloDistributionChartData(clo.clo_id)} 
                          options={distributionOptions} 
                        />
                        <div className="mt-3 text-center">
                          <p><strong>ร้อยละความสำเร็จเฉลี่ย:</strong> {clo.avg_achievement}%</p>
                          <p><strong>อัตราการผ่าน:</strong> {clo.passing_rate}% ({clo.passed_students}/{clo.total_students} คน)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* คำแนะนำในการปรับปรุงรายวิชา */}
              <div className="card mt-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">คำแนะนำในการปรับปรุงรายวิชา</h5>
                </div>
                <div className="card-body">
                  <p>จากการวิเคราะห์ผลการเรียนรู้ของนักศึกษา มีข้อเสนอแนะดังนี้:</p>
                  <ul>
                    {courseData.clo_summary.some(clo => clo.avg_achievement < 70) && (
                      <li>
                        <strong>ควรปรับปรุงการสอนในส่วนของ:</strong>
                        <ul>
                          {courseData.clo_summary
                            .filter(clo => clo.avg_achievement < 70)
                            .map(clo => (
                              <li key={clo.clo_id}>
                                <strong>{clo.clo_code}:</strong> {clo.description} 
                                (ร้อยละความสำเร็จเฉลี่ย {clo.avg_achievement}%)
                              </li>
                            ))
                          }
                        </ul>
                      </li>
                    )}
                    
                    {courseData.clo_summary.some(clo => clo.passing_rate < 70) && (
                      <li>
                        <strong>CLO ที่มีอัตราการผ่านต่ำกว่า 70%:</strong>
                        <ul>
                          {courseData.clo_summary
                            .filter(clo => clo.passing_rate < 70)
                            .map(clo => (
                              <li key={clo.clo_id}>
                                <strong>{clo.clo_code}:</strong> มีนักศึกษาผ่านเพียง {clo.passing_rate}% 
                                ({clo.passed_students} จาก {clo.total_students} คน)
                              </li>
                            ))
                          }
                        </ul>
                      </li>
                    )}
                    
                    <li>
                      <strong>แนวทางการปรับปรุง:</strong>
                      <ul>
                        <li>เพิ่มกิจกรรมการเรียนรู้เชิงรุก (Active Learning) เพื่อส่งเสริมความเข้าใจในเนื้อหา</li>
                        <li>ปรับปรุงเอกสารประกอบการสอนให้เข้าใจง่ายขึ้น</li>
                        <li>จัดกิจกรรมเสริมสำหรับนักศึกษาที่มีผลการเรียนรู้ต่ำกว่าเกณฑ์</li>
                        <li>ทบทวนวิธีการวัดและประเมินผลให้สอดคล้องกับ CLO มากขึ้น</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseAnalysis;