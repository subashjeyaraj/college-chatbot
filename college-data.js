/**
 * College Chatbot - Central Knowledge Base & Storage Engine
 * 100% Client-Side, Serverless, Persistent via LocalStorage
 */

const DEFAULT_USERS = [
    { username: "admin", password: "admin123", role: "admin", name: "Campus Administrator" },
    { username: "student", password: "student123", role: "student", name: "Alex Johnson" }
];

const DEFAULT_CHAT_DATA = [
    {
        id: "faq_syllabus",
        category: "Academics",
        keyword: "syllabus",
        aliases: ["curriculum", "courses", "subjects", "study material", "btech syllabus", "course structure"],
        response: "Here is the official academic curriculum handbook for the current academic year. It contains the semester-wise syllabus, elective course options, lab manuals, and evaluation criteria for all undergraduate and postgraduate engineering branches.",
        image: "",
        fileName: "Apex_University_Academic_Syllabus_2024-25.txt",
        file: "data:text/plain;charset=utf-8," + encodeURIComponent(
            "APEX UNIVERSITY - OFFICIAL ACADEMIC SYLLABUS (2024-2025)\n" +
            "==========================================================\n\n" +
            "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n\n" +
            "SEMESTER 1:\n- Engineering Mathematics I\n- Physics for Computing\n- Problem Solving & Python Programming\n- Basic Electrical & Electronics\n- Professional English\n\n" +
            "SEMESTER 2:\n- Engineering Mathematics II\n- Data Structures & Algorithms\n- Digital Logic & Computer Organization\n- Web Technologies (HTML5, CSS, JS)\n- Environmental Science\n\n" +
            "SEMESTER 3 & 4 (CORE):\n- Database Management Systems (DBMS)\n- Operating Systems & Kernel Architecture\n- Object-Oriented Software Engineering (Java/C++)\n- Artificial Intelligence & Machine Learning Fundamentals\n- Computer Networks & Security Protocols\n\n" +
            "ELECTIVES OFFERED:\n- Cloud Computing & DevOps\n- Cyber Security & Cryptography\n- Deep Learning & NLP\n- Blockchain Technologies\n\n" +
            "For full details, visit the Academic Dean Office or check your Student Portal."
        )
    },
    {
        id: "faq_campus",
        category: "Campus Life",
        keyword: "campus",
        aliases: ["map", "location", "building", "directions", "where is", "grounds", "infrastructure"],
        response: "Welcome to Apex University! Our 50-acre smart green campus features state-of-the-art infrastructure including Academic Blocks (A to E), Central High-Tech Library, Innovation & AI Hub, Sports Arena, Cafeteria, and Student Activity Center. Check out the aerial campus view below!",
        image: "assets/campus-view.jpg",
        fileName: "",
        file: ""
    },
    {
        id: "faq_fees",
        category: "Admissions & Fees",
        keyword: "fee",
        aliases: ["fees", "tuition", "payment", "cost", "fee structure", "due date", "installment"],
        response: "💰 **Annual Tuition Fee Schedule (2024-2025):**\n\n• **B.Tech / B.E (All Specializations):** ₹1,25,000 / year ($1,500/semester)\n• **BCA / B.Sc Computer Science:** ₹85,000 / year\n• **M.Tech / MBA:** ₹1,40,000 / year\n• **Examination Fee:** ₹2,500 / semester\n\n💳 **Payment Methods:** Online via Student ERP (UPI, NetBanking, Credit/Debit Card) or Demand Draft at the Finance Counter.\n⚠️ **Notice:** Semester fees must be cleared by the 15th of each semester term to avoid late penalties.",
        image: "",
        fileName: "Fee_Structure_and_Payment_Policy.txt",
        file: "data:text/plain;charset=utf-8," + encodeURIComponent(
            "APEX UNIVERSITY - OFFICIAL FEE STRUCTURE & REFUND POLICY\n" +
            "==========================================================\n\n" +
            "1. TUITION FEES (Per Annum):\n" +
            "- B.Tech (CSE, AI/DS, IT): INR 1,25,000\n" +
            "- B.Tech (ECE, Mech, Civil): INR 1,10,000\n" +
            "- Management (BBA/MBA): INR 1,40,000\n\n" +
            "2. HOSTEL & MESS (Optional, Per Annum):\n" +
            "- Triple Sharing Non-AC: INR 65,000\n" +
            "- Twin Sharing AC: INR 95,000\n\n" +
            "3. PAYMENT MODES:\n" +
            "- NetBanking / UPI / Cards via ERP portal: https://erp.apexuniversity.edu\n" +
            "- Accounts Office: Block B, Room 104 (Mon-Fri 9:30 AM - 4:00 PM)"
        )
    },
    {
        id: "faq_exams",
        category: "Academics",
        keyword: "exam",
        aliases: ["exams", "timetable", "datesheet", "schedule", "hall ticket", "admit card", "results"],
        response: "📅 **Examination Schedule & Updates:**\n\n• **Mid-Semester Exams:** Oct 15th - Oct 24th\n• **Final End-Semester Exams:** Dec 4th - Dec 22nd\n• **Hall Tickets:** Download available on the Student Portal 7 days prior to exam start.\n• **Passing Criteria:** Minimum 40% in theory + practical, with mandatory 75% class attendance.\n\nGood luck with your preparations! Contact the Controller of Examinations (COE) for any grievance.",
        image: "",
        fileName: "Exam_Regulations_and_Guidelines.txt",
        file: "data:text/plain;charset=utf-8," + encodeURIComponent(
            "APEX UNIVERSITY - CONTROLLER OF EXAMINATIONS (COE)\n" +
            "==========================================================\n\n" +
            "EXAMINATION CODE OF CONDUCT:\n" +
            "1. Students must carry their College ID Card and Hall Ticket for entry.\n" +
            "2. Mobile phones, smart watches, and unauthorized material are strictly prohibited inside examination halls.\n" +
            "3. Late arrival of more than 15 minutes will not be permitted.\n" +
            "4. For re-evaluation and script review, apply within 10 days of results declaration."
        )
    },
    {
        id: "faq_placements",
        category: "Placements",
        keyword: "placement",
        aliases: ["placements", "jobs", "companies", "salary", "package", "internship", "recruitment", "hire"],
        response: "🚀 **Apex Career & Placement Cell (ACPC) Highlights:**\n\n• **Highest Package Offered:** 44.5 LPA (Google / Atlassian)\n• **Average Salary Package:** 8.6 LPA\n• **Placement Success Rate:** 94.6% of registered students placed\n• **Top Recruiters:** Microsoft, Amazon, Infosys, TCS Digital, Deloitte, Accenture, Wipro, Capgemini, IBM\n\n🌟 Internships with stipend opportunities begin from 5th semester onwards. Pre-placement training (DSA, Aptitude, Soft Skills) is fully provided.",
        image: "",
        fileName: "Placement_Statistics_Report_2024.txt",
        file: "data:text/plain;charset=utf-8," + encodeURIComponent(
            "APEX UNIVERSITY - ANNUAL RECRUITMENT & PLACEMENT REPORT\n" +
            "==========================================================\n\n" +
            "HIGHLIGHTS:\n" +
            "- Total Offers Made: 1,420+\n" +
            "- Super Dream Offers (>20 LPA): 68\n" +
            "- Dream Offers (>10 LPA): 315\n" +
            "- Number of Visiting Companies: 185+\n\n" +
            "Placement Office: Block C, Ground Floor\n" +
            "Email: placements@apexuniversity.edu"
        )
    },
    {
        id: "faq_hostel",
        category: "Campus Life",
        keyword: "hostel",
        aliases: ["room", "accommodation", "dorm", "mess", "food", "stay", "warden", "living"],
        response: "🏢 **Hostel & Residential Amenities:**\n\n• Separate, secure residential blocks for Boys and Girls on campus.\n• 24/7 High-speed Wi-Fi, biometric security, CCTV, and medical clinic.\n• Air-conditioned and well-ventilated Non-AC room choices (Twin/Triple sharing).\n• Four nutritious meals daily (Breakfast, Lunch, Evening Snacks & Dinner) with pure vegetarian and non-vegetarian counters.\n\n📞 **Chief Warden Desk:** +91 98765-43210 | hostel@apexuniversity.edu",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_admissions",
        category: "Admissions & Fees",
        keyword: "admission",
        aliases: ["admissions", "apply", "eligibility", "criteria", "cutoff", "entrance", "enroll"],
        response: "🎓 **Admissions 2024-2025 are Currently Open!**\n\n• **Undergraduate (B.Tech / BCA / BBA):** Minimum 60% aggregate in 10+2 with Physics and Mathematics. Valid scores in JEE Main or Apex CET.\n• **Postgraduate (M.Tech / MBA / MCA):** Bachelor’s degree in relevant discipline with minimum 55% marks + GATE / CAT / MAT or University Entrance.\n• **Application Steps:** Fill out online registration form, upload transcripts, book verification slot, and pay processing fee online.",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_library",
        category: "Facilities",
        keyword: "library",
        aliases: ["books", "digital library", "timings", "reading room", "ieee", "journals", "study"],
        response: "📚 **Central Tech Library & Learning Hub:**\n\n• **Operating Timings:** Monday - Saturday: 8:00 AM to 10:00 PM (24/7 during final exam weeks)\n• **Collection:** 65,000+ volumes, 150 print journals, and 1,200+ audio-visual study materials.\n• **Digital Database:** Free campus-wide access to IEEE Xplore, ACM Digital Library, SpringerLink, and ScienceDirect.\n• **Borrowing Limit:** 4 books for 14 days per student (renewable online).",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_scholarship",
        category: "Admissions & Fees",
        keyword: "scholarship",
        aliases: ["scholarships", "financial aid", "merit", "concession", "waiver", "discount"],
        response: "✨ **Merit & Need-Based Scholarships:**\n\n• **Chancellor’s Merit Award:** 100% tuition waiver for Board toppers and JEE Rank < 10,000.\n• **Academic Excellence:** 50% tuition waiver for 90%+ marks in 10+2.\n• **Sports & Cultural Stars:** 25% to 75% fee concession for State/National level athletes.\n• **Single Girl Child & Defence Wards:** Special 20% financial grants.\n\nSubmit applications at the Student Welfare Office by September 30th.",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_contact",
        category: "General",
        keyword: "contact",
        aliases: ["phone", "email", "helpline", "principal", "hod", "address", "reach", "help desk", "support"],
        response: "📞 **Important College Contacts & Helplines:**\n\n• **General Enquiries:** +91 11 2345 6789 | info@apexuniversity.edu\n• **Admissions Cell:** +91 11 2345 6790 | admissions@apexuniversity.edu\n• **Academic Dean Office:** dean.academics@apexuniversity.edu\n• **Accounts & Fee Desk:** accounts@apexuniversity.edu\n• **Anti-Ragging Squad (24x7):** 1800-180-5522 (Toll Free) | antiragging@apexuniversity.edu\n• **Campus Security & Medical Emergency:** +91 11 2345 9999",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_attendance",
        category: "Academics",
        keyword: "attendance",
        aliases: ["absent", "leave", "medical leave", "od", "percentage", "minimum attendance"],
        response: "📋 **College Attendance Regulations:**\n\n• A minimum of **75% aggregate attendance** is mandatory in each subject to be eligible for university semester examinations.\n• Students with attendance between 65% and 74% due to medical conditions or official on-duty (OD) university representation must submit approved documentation within 3 working days to the Dean of Students.\n• Track your live real-time attendance subject-wise on the Student ERP portal.",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_clubs",
        category: "Campus Life",
        keyword: "clubs",
        aliases: ["events", "fest", "cultural", "sports", "hackathon", "robotics", "activities"],
        response: "🎉 **Student Clubs & Cultural Life:**\n\nJoin over 25 vibrant student-run clubs!\n• **Technical:** Google Developer Student Club (GDSC), Coding Studio, Robotics & IoT Club, AI Nexus.\n• **Cultural:** Music & Band Society ('Symphony'), Dance Troupe, Dramatics, Fine Arts.\n• **Literary & Media:** Model United Nations (MUN), Debating League, Campus Press.\n• **Annual Fests:** 'InnovateX' (National Tech Fest in Feb) & 'Aura' (Annual Cultural Gala in Nov).",
        image: "",
        fileName: "",
        file: ""
    },
    {
        id: "faq_transport",
        category: "Facilities",
        keyword: "transport",
        aliases: ["bus", "buses", "routes", "travel", "commute", "pickup", "metro"],
        response: "🚌 **Campus Bus & Transit System:**\n\n• College runs a fleet of 35 air-conditioned, GPS-tracked buses connecting all prominent city sectors, railway junctions, and metro terminals.\n• Bus passes can be applied for at the Transit Office (Block A Basement).\n• Annual Bus Pass Fee: ₹18,000.\n• Real-time bus location tracking is integrated into the Apex Campus Mobile App.",
        image: "",
        fileName: "",
        file: ""
    }
];

// College Storage & API Manager
class CollegeStorage {
    static init() {
        if (!localStorage.getItem("users")) {
            localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem("chatData") || JSON.parse(localStorage.getItem("chatData") || "[]").length === 0) {
            localStorage.setItem("chatData", JSON.stringify(DEFAULT_CHAT_DATA));
        }
        if (!localStorage.getItem("chatQueryCount")) {
            localStorage.setItem("chatQueryCount", "128");
        }
    }

    static getUsers() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem("users")) || DEFAULT_USERS;
        } catch (e) {
            return DEFAULT_USERS;
        }
    }

    static saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    static getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("currentUser"));
        } catch (e) {
            return null;
        }
    }

    static setCurrentUser(user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    }

    static getChatData() {
        this.init();
        try {
            const data = JSON.parse(localStorage.getItem("chatData"));
            return (Array.isArray(data) && data.length > 0) ? data : DEFAULT_CHAT_DATA;
        } catch (e) {
            return DEFAULT_CHAT_DATA;
        }
    }

    static saveChatData(data) {
        localStorage.setItem("chatData", JSON.stringify(data));
    }

    static resetToDefault() {
        localStorage.setItem("chatData", JSON.stringify(DEFAULT_CHAT_DATA));
        localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
        return DEFAULT_CHAT_DATA;
    }

    static incrementQueryCount() {
        const count = parseInt(localStorage.getItem("chatQueryCount") || "0", 10) + 1;
        localStorage.setItem("chatQueryCount", count.toString());
        return count;
    }

    static getStats() {
        const chatData = this.getChatData();
        const users = this.getUsers();
        const queryCount = parseInt(localStorage.getItem("chatQueryCount") || "128", 10);
        const categories = [...new Set(chatData.map(item => item.category || "General"))];

        return {
            totalResponses: chatData.length,
            totalCategories: categories.length,
            totalUsers: users.length,
            totalQueries: queryCount,
            categories
        };
    }
}

// Auto-initialize on load
CollegeStorage.init();
