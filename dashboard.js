document.addEventListener("DOMContentLoaded", function () {
    // 1. Dashboard Cards Security Check (Admin, Teacher, Student)
    const cardLinks = document.querySelectorAll(".cards a");

    cardLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const savedRole = localStorage.getItem("user_role");
            const targetPage = this.getAttribute("href");

            if (!savedRole) {
                event.preventDefault();
                alert("Please login first!");
                window.location.href = "login.html";
                return;
            }

            if (
                (targetPage === "admin.html" && savedRole !== "admin") ||
                (targetPage === "teacher.html" && savedRole !== "teacher") ||
                (targetPage === "student.html" && savedRole !== "student")
            ) {
                event.preventDefault();
                alert("Access Denied! You are logged in as " + savedRole.toUpperCase());
            }
        });
    });

    // 2. Logout Button (yadi page ma #logout id xa bhane)
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.onclick = function (event) {
            event.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                window.location.href = "index.html";
            }
        };
    }
});
