if (localStorage.getItem("user_role") !== "teacher") {
    alert("Access Denied! Teacher login required.");
    window.location.href = "login.html";
}

let currentLedgerId = null;
let currentSubject = "";
let currentFaculty = "";
let currentSemester = "";
let attendanceMode = "take";

// Page load huda aaja ko date set garne ra teacher ko ledgers load garne
window.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("att-date");
    dateInput.valueAsDate = new Date();

    // Date change garda tyo din ko purano attendance auto-load garne
    dateInput.addEventListener("change", () => {
        if (currentLedgerId) loadStudents(currentLedgerId);
    });

    loadTeacherLedgers();
});

// 1. Admin le assign gareko Ledgers load garne
async function loadTeacherLedgers() {
    const userId = localStorage.getItem("user_id");
    const grid = document.getElementById("teacher-ledgers-grid");

    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`backend/get_teacher_ledgers.php?user_id=${userId}`);
        const ledgers = await res.json();

        if (ledgers.length === 0) {
            grid.innerHTML = `<p>No ledgers assigned to your email yet. Please ask Admin to assign your email in Faculty & Ledger.</p>`;
            return;
        }

        grid.innerHTML = "";
        ledgers.forEach(l => {
            grid.innerHTML += `
                <div class="ledger-card" onclick="openLedger(${l.ledger_id}, '${l.subject_name.replace(/'/g, "\\'")}', '${l.program_name.replace(/'/g, "\\'")}', '${l.semester_name.replace(/'/g, "\\'")}')">
                    <h3>${l.subject_name}</h3>
                    <p>Program: ${l.program_name} | ${l.semester_name}</p>
                    <p>Total Students: ${l.studentIds.length}</p>
                    <span class="badge-present">Click to Open</span>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        grid.innerHTML = "<p>Error loading ledgers.</p>";
    }
}

// 2. Sidebar tabs switch garne
function openTeacherTab(tabId, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    let target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (element) element.classList.add('active');

    if (tabId === 'report-area' && currentLedgerId) {
        loadReport();
    }
}

// 3. Ledger card click garda Attendance ra Report load garne
function openLedger(ledgerId, subject, faculty, semester) {
    currentLedgerId = ledgerId;
    currentSubject = subject;
    currentFaculty = faculty;
    currentSemester = semester;

    document.getElementById('selected-subject-title').innerText = `${subject} - ${faculty} (${semester})`;
    loadStudents(ledgerId);
    loadReport();

    let attendanceMenu = document.querySelectorAll('.menu-item')[1];
    openTeacherTab('attendance-area', attendanceMenu);
}

// 4. Take vs Edit Attendance mode switch garne
function switchAttendanceMode(mode) {
    attendanceMode = mode;
    let heading = document.getElementById('mode-heading');
    if (heading) {
        heading.innerText = mode === 'edit' 
            ? 'Edit Attendance (Select Date to Modify)' 
            : 'Take Daily Attendance';
    }
    if (currentLedgerId) loadStudents(currentLedgerId);
}

// 5. Ledger ma assign vayeka students ra selected date ko saved attendance tanne
async function loadStudents(ledgerId) {
    const tbody = document.getElementById("student-list-body");
    const date = document.getElementById("att-date").value;
    tbody.innerHTML = "<tr><td colspan='3'>Loading students...</td></tr>";

    try {
        const [stRes, attRes] = await Promise.all([
            fetch(`backend/get_students.php?ledger_id=${ledgerId}`),
            fetch(`backend/get_attendance_by_date.php?subject=${encodeURIComponent(currentSubject)}&date=${encodeURIComponent(date)}`)
        ]);

        const students = await stRes.json();
        const savedAttendance = await attRes.json();

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan='3'>No students assigned in this ledger.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        students.forEach(st => {
            const status = savedAttendance[st.id] || "Present";
            tbody.innerHTML += `
                <tr>
                    <td>${st.roll}</td>
                    <td>${st.name}</td>
                    <td>
                        <label class="radio-label"><input type="radio" name="att_${st.id}" value="Present" ${status === "Present" ? "checked" : ""}> Present</label>
                        <label class="radio-label"><input type="radio" name="att_${st.id}" value="Absent" ${status === "Absent" ? "checked" : ""}> Absent</label>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan='3'>Error loading students.</td></tr>`;
    }
}

// 6. Attendance Submit / Update garne
document.getElementById("attendanceForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!currentLedgerId) {
        alert("Please select a ledger first from 'My Ledgers'!");
        return;
    }

    const date = document.getElementById("att-date").value;
    const teacher_id = localStorage.getItem("user_id") || 1;
    const rows = document.querySelectorAll("#student-list-body tr");
    let records = [];

    rows.forEach(row => {
        const radio = row.querySelector("input[type='radio']:checked");
        if (radio) {
            const student_id = radio.name.split("_")[1];
            records.push({ student_id: student_id, status: radio.value });
        }
    });

    if (records.length === 0) {
        alert("No students to submit!");
        return;
    }

    try {
        const res = await fetch("backend/save_attendance.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacher_id, subject: currentSubject, date, records })
        });

        const result = await res.json();
        alert(result.message);
        loadReport();
    } catch (error) {
        alert("Failed to save attendance.");
    }
});

// 7. Subject-wise Report dekhaune
async function loadReport() {
    if (!currentLedgerId) return;
    const tbody = document.getElementById("report-body");

    try {
        const res = await fetch(`backend/get_report.php?ledger_id=${currentLedgerId}&subject=${encodeURIComponent(currentSubject)}`);
        const data = await res.json();

        tbody.innerHTML = "";
        data.forEach(row => {
            const badgeClass = row.percentage >= 75 ? "badge-present" : "badge-absent";
            tbody.innerHTML += `
                <tr>
                    <td>${row.roll}</td>
                    <td>${row.name}</td>
                    <td>${row.total_classes}</td>
                    <td>${row.present_days}</td>
                    <td>${row.absent_days}</td>
                    <td><span class="${badgeClass}">${row.percentage}%</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

// 8. Profile Modal & Logout
async function openProfile() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return alert("Please login first!");

    document.getElementById("profileModal").style.display = "flex";
    const content = document.getElementById("profileContent");
    content.innerHTML = "Loading profile...";

    try {
        const res = await fetch(`backend/get_profile.php?id=${userId}`);
        const data = await res.json();

        if (data.status === "success") {
            const u = data.user;
            content.innerHTML = `
                <p><strong>ID:</strong> ${u.id}</p>
                <p><strong>Full Name:</strong> ${u.name}</p>
                <p><strong>Email:</strong> ${u.email}</p>
                <p><strong>Role:</strong> ${u.role.toUpperCase()}</p>
            `;
        } else {
            content.innerHTML = data.message;
        }
    } catch (e) {
        content.innerHTML = "Error loading profile.";
    }
}

function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function downloadTeacherPDF() {
    const tbody = document.getElementById("report-body");
    if (!tbody || tbody.children.length === 0) {
        alert("Please open a ledger first to generate a report!");
        return;
    }

    const title = document.getElementById("selected-subject-title").innerText;
    const tableHTML = document.querySelector("#report-area table").outerHTML;

    const printWin = window.open("", "", "width=850,height=650");
    printWin.document.write(`
        <html>
        <head>
            <title>Subject Attendance Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; }
                h1 { text-align: center; color: #1e3a8a; margin-bottom: 5px; }
                .info { text-align: center; margin-bottom: 20px; font-size: 15px; font-weight: bold; color: #334155; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
                th { background-color: #f1f5f9; }
            </style>
        </head>
        <body>
            <h1>Subject-wise Attendance Report</h1>
            <div class="info">${title}</div>
            ${tableHTML}
        </body>
        </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 300);
}
