USE react_ploclo;

CREATE TABLE `clo` (
  `CLO_id` int NOT NULL AUTO_INCREMENT,
  `CLO_code` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `CLO_name` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `CLO_engname` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`CLO_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `course` (
  `course_id` int NOT NULL,
  `course_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `course_engname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `plo` (
  `PLO_id` int NOT NULL AUTO_INCREMENT,
  `PLO_code` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PLO_name` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `PLO_engname` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PLO_id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `program` (
  `code` VARCHAR(50),
  `program_id` int NOT NULL AUTO_INCREMENT,
  `program_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `program_name_th` VARCHAR(255),
  `year` INT(4),
  `program_shortname_en` VARCHAR(50),
  `program_shortname_th` VARCHAR(50),
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`program_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `section` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `semester` (
  `semester_id` int NOT NULL AUTO_INCREMENT,
  `semester_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`semester_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `course_clo` (
  `course_clo_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `clo_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `section_id` int NOT NULL,
  `year` int DEFAULT NULL,
  `weight` INT DEFAULT 0,
  PRIMARY KEY (`course_clo_id`),
  KEY `course_id` (`course_id`),
  KEY `clo_id` (`clo_id`),
  KEY `semester_id` (`semester_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `course_clo_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  CONSTRAINT `course_clo_ibfk_2` FOREIGN KEY (`clo_id`) REFERENCES `clo` (`CLO_id`) ON DELETE CASCADE,
  CONSTRAINT `course_clo_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`) ON DELETE CASCADE,
  CONSTRAINT `course_clo_ibfk_4` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `course_plo` (
  `course_plo_id` int NOT NULL AUTO_INCREMENT,
  `weight` int NOT NULL,
  `plo_id` int NOT NULL,
  `course_id` int NOT NULL,
  PRIMARY KEY (`course_plo_id`),
  KEY `plo_id` (`plo_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_plo_ibfk_1` FOREIGN KEY (`plo_id`) REFERENCES `plo` (`PLO_id`),
  CONSTRAINT `course_plo_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `plo_clo` (
  `PLO_CLO_id` int NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `weight` int NOT NULL,
  `semester_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `section_id` int DEFAULT NULL,
  `PLO_id` int NOT NULL,
  `CLO_id` int NOT NULL,
  PRIMARY KEY (`PLO_CLO_id`),
  KEY `semester_id` (`semester_id`),
  KEY `course_id` (`course_id`),
  KEY `section_id` (`section_id`),
  KEY `PLO_id` (`PLO_id`),
  KEY `CLO_id` (`CLO_id`),
  CONSTRAINT `plo_clo_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`),
  CONSTRAINT `plo_clo_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `plo_clo_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`),
  CONSTRAINT `plo_clo_ibfk_4` FOREIGN KEY (`PLO_id`) REFERENCES `plo` (`PLO_id`),
  CONSTRAINT `plo_clo_ibfk_5` FOREIGN KEY (`CLO_id`) REFERENCES `clo` (`CLO_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `program_course` (
  `program_course_id` int NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `semester_id` int NOT NULL,
  `course_id` int NOT NULL,
  `section_id` int NOT NULL,
  `program_id` int NOT NULL,
  PRIMARY KEY (`program_course_id`),
  KEY `semester_id` (`semester_id`),
  KEY `course_id` (`course_id`),
  KEY `section_id` (`section_id`),
  KEY `fk_program_id` (`program_id`),
  CONSTRAINT `program_course_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`),
  CONSTRAINT `program_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `program_course_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `program_plo` (
  `program_PLO_id` int NOT NULL AUTO_INCREMENT,
  `program_id` int NOT NULL,
  `plo_id` int NOT NULL,
  PRIMARY KEY (`program_PLO_id`),
  KEY `program_id` (`program_id`),
  KEY `plo_id` (`plo_id`),
  CONSTRAINT `program_plo_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`) ON DELETE CASCADE,
  CONSTRAINT `program_plo_ibfk_2` FOREIGN KEY (`plo_id`) REFERENCES `plo` (`PLO_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `studentdata` (
  `student_id` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `program_id` int(11) COLLATE utf8mb4_general_ci NOT NULL,
  `course_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `section_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `year` int NOT NULL,
  `assignment_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `faculty_id` int(11) NOT NULL,
  `university_id` int(11) NOT NULL,
  PRIMARY KEY (`assignment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `assignments_students` (
  `student_id` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `assignment_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`,`assignment_id`),
  KEY `FK_assignments_students_assignment` (`assignment_id`),
  CONSTRAINT `FK_assignments_students_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  CONSTRAINT `FK_assignments_students_student` FOREIGN KEY (`student_id`) REFERENCES `studentdata` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `assignment_clo_selection` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clo_id` int NOT NULL,
  `assignment_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `score` int DEFAULT NULL,
  `weight` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE university (
    university_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    university_name_en VARCHAR(255) NOT NULL, -- ชื่อมหาวิทยาลัยภาษาอังกฤษ
    university_name_th VARCHAR(255) NOT NULL, -- ชื่อมหาวิทยาลัยภาษาไทย
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE university_program (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    university_id INT(11),  -- เชื่อมไปยังมหาวิทยาลัย
    program_id INT(11),     -- เชื่อมไปยังหลักสูตร
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES program(program_id) ON DELETE CASCADE
);

CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_name_th VARCHAR(255) NOT NULL,
	  faculty_name_en VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE university_faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT(11) NOT NULL,
    faculty_id INT(11) NOT NULL,
    FOREIGN KEY (university_id) REFERENCES university(university_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE program_faculty (
    program_id INT(11) NOT NULL,
    faculty_id INT(11) NOT NULL,
    PRIMARY KEY (program_id, faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE student_assignment_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  assignment_id INT NOT NULL,
  assignment_clo_id INT NOT NULL,
  score DECIMAL(5,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES studentdata(student_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
  FOREIGN KEY (assignment_clo_id) REFERENCES assignment_clo_selection(id),
  UNIQUE KEY unique_score (student_id, assignment_id, assignment_clo_id)
) COLLATE utf8mb4_general_ci;

-- Add the id column from assignment_clo_selection to assignments_students table
ALTER TABLE assignments_students
ADD COLUMN assignment_clo_id int(11) AFTER assignment_id;

-- If you already have data in the table and want to copy id values from assignment_clo_selection 
-- based on matching assignment_id values, you could run:
UPDATE assignments_students AS as_std
JOIN assignment_clo_selection AS a_clo ON as_std.assignment_id = a_clo.assignment_id
SET as_std.assignment_clo_id = a_clo.id;


-- ลบ Foreign Key Constraints ก่อน 
ALTER TABLE assignments_students DROP FOREIGN KEY FK_assignments_students_assignment;

-- สร้าง UNIQUE INDEX เพิ่มเติม
ALTER TABLE assignments_students ADD UNIQUE INDEX idx_unique_student_assignment_clo 
(student_id, assignment_id, assignment_clo_id);

-- 1. ลบ Foreign Key ก่อน
ALTER TABLE assignments_students
DROP FOREIGN KEY FK_assignments_students_student;

-- 2. ลบ Primary Key และ Unique Index
ALTER TABLE assignments_students
DROP PRIMARY KEY,
DROP INDEX idx_unique_student_assignment_clo;

-- 3. เพิ่ม ID และตั้งเป็น Primary Key ใหม่
ALTER TABLE assignments_students
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;

-- 4. สร้าง Index เพื่อประสิทธิภาพในการค้นหา
CREATE INDEX idx_student_id ON assignments_students (student_id);
CREATE INDEX idx_student_assignment ON assignments_students (student_id, assignment_id);
CREATE INDEX idx_assignment_clo ON assignments_students (assignment_clo_id);

-- 5. สร้าง Foreign Key กลับคืน
ALTER TABLE assignments_students
ADD CONSTRAINT FK_assignments_students_student FOREIGN KEY (student_id) REFERENCES studentdata (student_id);

-- ข้อมูลเทส
SET NAMES 'utf8mb4';
SET character_set_client = 'utf8mb4';
SET character_set_connection = 'utf8mb4';
SET character_set_results = 'utf8mb4';
INSERT INTO university(university_id, university_name_en, university_name_th)
VALUES (1,"Naresuan University","มหาวิทยาลัยนเรศวร");

INSERT INTO faculty(faculty_id, faculty_name_th, faculty_name_en)
VALUES (1,"Faculty of Engineering","คณะวิศวกรรมศาสตร์");

INSERT INTO university_faculty(id, university_id, faculty_id)
VALUES (1,1,1);

INSERT INTO semester(semester_id, semester_name)
VALUES (1,'ภาคเรียนที่ 1'),(2,'ภาคเรียนที่ 2'),(3,'ภาคเรียนที่3'),(4,'ภาคเรียนที่ 4');

INSERT INTO section()
VALUES (1);
