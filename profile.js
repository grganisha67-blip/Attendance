window.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`backend/get_profile.php?id=${userId}`);
        const data = await res.json();

        if (data.status === "success") {
            const u = data.user;
            document.getElementById("avatarLetter").innerText = u.name.charAt(0).toUpperCase();
            document.getElementById("userName").innerText = u.name;
            document.getElementById("userRole").innerText = u.role.toUpperCase();

            let html = `
                <p><strong>User ID:</strong> ${u.id}</p>
                <p><strong>Email:</strong> ${u.email}</p>
            `;

            if (u.role === "student") {
                html += `
                    <p><strong>Faculty:</strong> ${u.faculty}</p>
                    <p><strong>Semester:</strong> ${u.semester}</p>
                `;
            }

            document.getElementById("profileInfo").innerHTML = html;
        }
    } catch (e) {
        document.getElementById("profileInfo").innerHTML = "<p>Error loading profile.</p>";
    }
});

// Role anushar aafno dashboard ma firta pathaune
function goBack() {
    const role = localStorage.getItem("user_role");
    if (role === "admin") window.location.href = "admin.html";
    else if (role === "teacher") window.location.href = "teacher.html";
    else window.location.href = "student.html";
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
