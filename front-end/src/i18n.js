import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


const resources = {
    th: {
        translation: {
            "CourseInfo": "หลักสูตร",
            "ViewChart": "แผนภูมิ",
            "Assignment": "การบ้าน",
            "Program": "หลักสูตร",
            "Edit Program": "แก้ไขหลักสูตร",
            "Edit PLO": "แก้ไข PLO",
            "Course": "รายวิชา",
            "Edit Course": "แก้ไขรายวิชา",
            "Edit CLO": "แก้ไข CLO",
            "About": "เกี่ยวกับ",
            "Select Language": "เลือกภาษา",
            "Course Information": "ข้อมูลหลักสูตร",
            "Courses in": "ข้อมูลหลักสูตรใน",
            "LOGIN": "เข้าสู่ระบบ",
            "Welcome": "ยินดีต้อนรับ",
            "Email": "อีเมล",
            "Role": "บทบาท",
            "LOGOUT": "ออกจากระบบ",
            "Program Information": "ข้อมูลหลักสูตร",
            "General Information": "ข้อมูลทั่วไป",
            "Program Learning Outcomes (PLO)": "ผลลัพธ์การเรียนรู้ระดับหลักสูตร (PLO)"
        }
    },
    en: {
        translation: {
            "CourseInfo": "Program",
            "ViewChart": "View Chart",
            "Assignment": "Assignment",
            "Program": "Program",
            "Edit Program": "Edit Program",
            "Edit PLO": "Edit PLO",
            "Course": "Course",
            "Edit Course": "Edit Course",
            "Edit CLO": "Edit CLO",
            "About": "About",
            "Select Language": "Select Language"
        }
    },
    // ch: {
    //     translation: {
    //         "CourseInfo": "课程信息",
    //         "ViewChart": "查看图表",
    //         "Assignment": "任务",
    //         "Program": "研究课程",
    //         "Edit Program": "教学课程",
    //         "Edit PLO": "编辑 PLO",
    //         "Course": "课程",
    //         "Edit Course": "编辑课程",
    //         "Edit CLO": "编辑 CLO",
    //         "About": "關於",
    //         "Select Language": "選擇語言"
    //     }
    // }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
