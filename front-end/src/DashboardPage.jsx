// DashboardPage.jsx
import React from "react";
import {
  CLOBarChart,
  PLOCoverageChart,
  PLOBarChart,
  ProgressChart,
  PLOMatrixTable,
  CourseSelector,
} from "./ViewChart";

function DashboardPage() {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">สถิติการประเมิน CLO / PLO</h2>
      <CourseSelector />

      <div className="row mt-4">
        <div className="col-md-6">
          <h5>ความครอบคลุมของ PLO</h5>
          <PLOCoverageChart />
        </div>
        <div className="col-md-6">
          <h5>ความก้าวหน้าสู่การสำเร็จการศึกษา</h5>
          <ProgressChart />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h5>กราฟแสดงความสำเร็จของ CLO</h5>
          <CLOBarChart />
        </div>
        <div className="col-md-6">
          <h5>กราฟแสดงความสำเร็จของ PLO</h5>
          <PLOBarChart />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h5>ตารางแสดงความสัมพันธ์ระหว่าง PLO และ CLO</h5>
          <PLOMatrixTable />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
