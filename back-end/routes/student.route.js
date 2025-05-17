import express from "express";
const router = express.Router();
import {
  insertStudent, 
  getAll, 
  deleteOne, 
  saveScore,
  getStudentsByProgram,
  addStudent,
  updateStudent,
  deleteStudent,
  importStudentsFromExcel
} from "../controllers/student.controller.js";

router.post("/", insertStudent);
router.get("/", getAll);
router.delete("/:id", deleteOne);
router.post("/scores", saveScore);
router.post("/program/excel", importStudentsFromExcel);
router.get("/program", getStudentsByProgram); 
router.post("/program", addStudent);
router.put("/program/:id", updateStudent); 
router.delete("/program/:id", deleteStudent);



export default router;
