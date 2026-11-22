if (localStorage.getItem("user_role") !== "admin") {
    alert("Access Denied! Admin login required.");
    window.location.href = "login.html";
}

const $ = id => document.getElementById(id);

let programs = [];
let semesters = [];
let subjects = [];
let faculty = [];
let students = [];
let ledgers = [];

async function fetchAllData() {
    const res = await fetch("backend/admin_api.php");
    const data = await res.json();
    programs = data.programs || [];
    semesters = data.semesters || [];
    subjects = data.subjects || [];
    faculty = data.faculty || [];
    students = data.students || [];
    ledgers = data.ledgers || [];
    displayData();
}

async function sendAction(payload) {
    await fetch("backend/admin_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    await fetchAllData();
}

function showPage(page, btn) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("show"));
    document.getElementById(page).classList.add("show");
    document.querySelectorAll(".sidebar nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function fillSelect(id, data, label) {
    const select = $(id);
    if (!select) return;
    const oldValue = select.value;
    select.innerHTML = '<option value="">Select</option>';
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${label(item)}</option>`;
    });
    select.value = oldValue;
}

const getProgram = id => programs.find(p => p.id == id)?.name || "-";
const getSemester = id => semesters.find(s => s.id == id)?.name || "-";
const getSubject = id => subjects.find(s => s.id == id)?.name || "-";
const getFaculty = id => faculty.find(f => f.id == id)?.name || "-";

function actions(type, id) {
    return `<button type="button" class="action-btn" onclick="editData('${type}', ${id})">✎</button> <button type="button" class="action-btn delete-btn" onclick="deleteData('${type}', ${id})">🗑</button>`;
}

function displayData() {
    fillSelect("semesterProgram", programs, p => p.name);
    fillSelect("subjectProgram", programs, p => p.name);
    fillSelect("subjectSemester", semesters, s => getProgram(s.programId) + " - " + s.name);
    fillSelect("studentSemester", semesters, s => getProgram(s.programId) + " - " + s.name);
    fillSelect("ledgerSubject", subjects, s => s.name);
    fillSelect("ledgerFaculty", faculty, f => f.name);

    const ledgerBox = $("ledgerStudents");
    if (ledgerBox) {
        ledgerBox.innerHTML = students.length === 0
            ? `<p style="color:#64748b;margin:0;">No students added yet.</p>`
            : students.map(s => `<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;"><input type="checkbox" class="ledger-student-cb" value="${s.id}" style="width:auto;margin:0;"><span>${s.name} (${s.roll})</span></label>`).join("");
    }

    $("programTable").innerHTML = programs.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.duration}</td><td>${actions("programs", p.id)}</td></tr>`).join("");
    $("semesterTable").innerHTML = semesters.map(s => `<tr><td>${s.id}</td><td>${getProgram(s.programId)}</td><td>${s.name}</td><td>${s.start} - ${s.end}</td><td><span class="status ${s.active ? "active-status" : "inactive-status"}">${s.active ? "Active" : "Inactive"}</span></td><td>${actions("semesters", s.id)}</td></tr>`).join("");
    $("subjectTable").innerHTML = subjects.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${getProgram(s.programId)}</td><td>${getSemester(s.semesterId)}</td><td>${actions("subjects", s.id)}</td></tr>`).join("");
    $("facultyTable").innerHTML = faculty.map(f => `<tr><td>${f.id}</td><td>${f.name}</td><td>${f.phone}</td><td>${f.email}</td><td>${actions("faculty", f.id)}</td></tr>`).join("");
    $("studentTable").innerHTML = students.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.roll}</td><td>${getSemester(s.semesterId)}</td><td>${actions("students", s.id)}</td></tr>`).join("");
    $("ledgerTable").innerHTML = ledgers.map(l => `<tr><td>${l.id}</td><td>${getSubject(l.subjectId)}</td><td>${getFaculty(l.facultyId)}</td><td>${l.studentIds.length}</td><td>${actions("ledgers", l.id)}</td></tr>`).join("");
}
$("programForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    await sendAction({ action: "add", type: "programs", name: $("programName").value, duration: $("programDuration").value });
    this.reset();
});

$("semesterForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    await sendAction({ action: "add", type: "semesters", programId: Number($("semesterProgram").value), name: $("semesterName").value, start: $("startDate").value, end: $("endDate").value, active: $("semesterActive").checked });
    this.reset();
});

$("subjectForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    await sendAction({ action: "add", type: "subjects", programId: Number($("subjectProgram").value), semesterId: Number($("subjectSemester").value), name: $("subjectName").value });
    this.reset();
});

$("facultyForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const phone = $("facultyPhone").value.trim();
    if (phone.length !== 10 || isNaN(phone)) {
        alert("Phone number must be exactly 10 digits!");
        return;
    }
    await sendAction({ action: "add", type: "faculty", name: $("facultyName").value, phone: phone, email: $("facultyEmail").value });
    this.reset();
});


$("studentForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const editId = $("editStudentId") ? $("editStudentId").value : "";
    await sendAction({
        action: editId ? "edit" : "add",
        type: "students",
        id: editId ? Number(editId) : undefined,
        name: $("studentName").value,
        roll: $("rollNo").value,
        semesterId: Number($("studentSemester").value)
    });
    cancelStudentEdit();
});

function cancelStudentEdit() {
    $("studentForm").reset();
    if ($("editStudentId")) $("editStudentId").value = "";
    if ($("studentSubmitBtn")) $("studentSubmitBtn").innerText = "Add Student";
    if ($("studentCancelBtn")) $("studentCancelBtn").style.display = "none";
}


$("ledgerForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const editId = $("editLedgerId") ? $("editLedgerId").value : "";
    const selectedStudents = Array.from(document.querySelectorAll(".ledger-student-cb:checked")).map(cb => Number(cb.value));
    if (selectedStudents.length === 0) return alert("Please select at least one student!");

    await sendAction({ action: editId ? "edit" : "add", type: "ledgers", id: editId ? Number(editId) : undefined, subjectId: Number($("ledgerSubject").value), facultyId: Number($("ledgerFaculty").value), studentIds: selectedStudents });
    cancelLedgerEdit();
});

function cancelLedgerEdit() {
    $("ledgerForm").reset();
    if ($("editLedgerId")) $("editLedgerId").value = "";
    if ($("ledgerSubmitBtn")) $("ledgerSubmitBtn").innerText = "Create Ledger";
    if ($("ledgerCancelBtn")) $("ledgerCancelBtn").style.display = "none";
    document.querySelectorAll(".ledger-student-cb").forEach(cb => cb.checked = false);
}

async function editData(type, id) {
    let list = programs;
    if (type === "semesters") list = semesters;
    else if (type === "subjects") list = subjects;
    else if (type === "faculty") list = faculty;
    else if (type === "students") list = students;
    else if (type === "ledgers") list = ledgers;

    const item = list.find(x => x.id === id);
    if (!item) return;

    if (type === "ledgers") {
        if ($("editLedgerId")) $("editLedgerId").value = item.id;
        $("ledgerSubject").value = item.subjectId;
        $("ledgerFaculty").value = item.facultyId;
        document.querySelectorAll(".ledger-student-cb").forEach(cb => { cb.checked = item.studentIds.includes(Number(cb.value)); });
        if ($("ledgerSubmitBtn")) $("ledgerSubmitBtn").innerText = "Update Ledger";
        if ($("ledgerCancelBtn")) $("ledgerCancelBtn").style.display = "inline-block";
        $("ledgerForm").scrollIntoView({ behavior: "smooth" });
        return;
    }

    if (type === "students") {
        if ($("editStudentId")) $("editStudentId").value = item.id;
        $("studentName").value = item.name;
        $("rollNo").value = item.roll;
        $("studentSemester").value = item.semesterId;
        if ($("studentSubmitBtn")) $("studentSubmitBtn").innerText = "Update Student";
        if ($("studentCancelBtn")) $("studentCancelBtn").style.display = "inline-block";
        $("studentForm").scrollIntoView({ behavior: "smooth" });
        return;
    }

    let payload = { action: "edit", type: type, id: id };

    if (type === "programs") {
        payload.name = prompt("Program Name", item.name) || item.name;
        payload.duration = prompt("Duration", item.duration) || item.duration;
    } else if (type === "semesters") {
        payload.name = prompt("Semester Name", item.name) || item.name;
        payload.start = prompt("Start Date", item.start) || item.start;
        payload.end = prompt("End Date", item.end) || item.end;
    } else if (type === "subjects") {
        payload.name = prompt("Subject Name", item.name) || item.name;
    } else if (type === "faculty") {
        payload.name = prompt("Faculty Name", item.name) || item.name;
        const newPhone = prompt("Phone Number (10 digits)", item.phone) || item.phone;
        if (newPhone.trim().length !== 10 || isNaN(newPhone.trim())) {
            alert("Phone number must be exactly 10 digits!");
            return;
        }
        payload.phone = newPhone.trim();
        payload.email = prompt("Email", item.email) || item.email;
    }

    await sendAction(payload);
}

async function deleteData(type, id) {
    if (!confirm("Are you sure you want to delete?")) return;
    await sendAction({ action: "delete", type, id });
}

$("subjectProgram").addEventListener("change", function() {
    const programId = Number(this.value);
    fillSelect("subjectSemester", semesters.filter(s => s.programId === programId), s => s.name);
});

fetchAllData();

function closeProfile() { document.getElementById("profileModal").style.display = "none"; }
function logout() { localStorage.clear(); window.location.href = "index.html"; }
