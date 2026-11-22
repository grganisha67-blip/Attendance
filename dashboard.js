document.addEventListener("DOMContentLoaded", function () {
    const cardLinks = document.querySelectorAll(".cards a");

    cardLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const savedRole = localStorage.getItem("user_role");
            const targetPage = this.getAttribute("href");

            let clickedRole = "";
            if (targetPage.includes("admin")) clickedRole = "admin";
            else if (targetPage.includes("teacher")) clickedRole = "teacher";
            else if (targetPage.includes("student")) clickedRole = "student";

            if (!savedRole) {
                event.preventDefault();
                window.location.href = `login.html?role=${clickedRole}`;
                return;
            }

            if (
                (clickedRole === "admin" && savedRole !== "admin") ||
                (clickedRole === "teacher" && savedRole !== "teacher") ||
                (clickedRole === "student" && savedRole !== "student")
            ) {
                event.preventDefault();
                alert("Access Denied! You are logged in as " + savedRole.toUpperCase());
            }
        });
    });

    // 2. Logout Button
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
