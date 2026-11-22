if (localStorage.getItem("user_role") !== "student") {
    alert("Access Denied! Student login required.");
    window.location.href = "login.html";
}

let allAttendanceHistory = [];


window.addEventListener("DOMContentLoaded", async () => {
    const studentId = localStorage.getItem("user_id");

    if (!studentId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`backend/get_student_attendance.php?student_id=${studentId}`);
        const data = await res.json();

        
        if (data.student) {
            document.getElementById("student-info").innerHTML = 
                `Student: <strong>${data.student.name}</strong> | Roll No: <strong>${data.student.roll}</strong> | ${data.student.faculty} - ${data.student.semester}`;
        }

        
        const grid = document.getElementById("subject-cards-grid");
        grid.innerHTML = "";

        if (data.subjects.length === 0) {
            grid.innerHTML = "<p>No attendance records found yet.</p>";
        } else {
            data.subjects.forEach(sub => {
                const lowClass = sub.percentage < 75 ? "progress-low" : "";
                grid.innerHTML += `
                    <div class="subject-card" onclick="showSubjectDetails('${sub.subject}', this)">
                        <h3>${sub.subject}</h3>
                        <p>Present: ${sub.present_days} / ${sub.total_classes} Classes</p>
                        <strong>${sub.percentage}%</strong>
                        <div class="progress-bg">
                            <div class="progress-fill ${lowClass}" style="width: ${sub.percentage}%;"></div>
                        </div>
                        <span class="click-hint">Click to view details &rarr;</span>
                    </div>
                `;
            });
        }

      
        allAttendanceHistory = data.history;
        const allBody = document.getElementById("all-subjects-body");
        allBody.innerHTML = "";

        data.history.forEach(item => {
            const badge = item.status === "Present" ? "badge-present" : "badge-absent";
            allBody.innerHTML += `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.subject}</td>
                    <td>${item.teacher_name}</td>
                    <td><span class="${badge}">${item.status}</span></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading attendance:", error);
    }
});


function openStudentTab(tabId, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    let target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (element) element.classList.add('active');
}

function showSubjectDetails(subjectName, cardElement) {
    document.querySelectorAll('.subject-card').forEach(c => c.style.borderColor = "");
    if (cardElement) cardElement.style.borderColor = "#2563eb";

    document.getElementById("detail-subject-title").innerText = `${subjectName} - Attendance History`;
    const tbody = document.getElementById("subject-detail-body");
    tbody.innerHTML = "";

    const filtered = allAttendanceHistory.filter(item => item.subject === subjectName);
    filtered.forEach(item => {
        const badge = item.status === "Present" ? "badge-present" : "badge-absent";
        tbody.innerHTML += `
            <tr>
                <td>${item.date}</td>
                <td>${item.teacher_name}</td>
                <td><span class="${badge}">${item.status}</span></td>
            </tr>
        `;
    });

    document.getElementById("subject-detail-box").style.display = "block";
}

function closeSubjectDetails() {
    document.getElementById("subject-detail-box").style.display = "none";
}

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
                ${u.role === 'student' ? `<p><strong>Faculty:</strong> ${u.faculty}</p><p><strong>Semester:</strong> ${u.semester}</p>` : ''}
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

function downloadStudentPDF() {
    if (!allAttendanceHistory || allAttendanceHistory.length === 0) {
        alert("No attendance records available to download!");
        return;
    }

    const studentInfo = document.getElementById("student-info").innerText;
    const tableHTML = document.querySelector("#all-subjects-tab table").outerHTML;

    const printWin = window.open("", "", "width=850,height=650");
    printWin.document.write(`
        <html>
        <head>
            <title>Student Attendance Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; }
                h1 { text-align: center; color: #1e3a8a; margin-bottom: 5px; }
                .info { text-align: center; margin-bottom: 20px; font-size: 14px; color: #475569; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
                th { background-color: #f1f5f9; }
            </style>
        </head>
        <body>
            <h1>Student Attendance Report</h1>
            <div class="info">${studentInfo}</div>
            ${tableHTML}
        </body>
        </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 300);
}
