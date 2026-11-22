const button = document.getElementById("learnBtn");

button.addEventListener("click", function(){

    alert(
        "Attendance Management System helps educational institutions manage attendance digitally. It improves efficiency, accuracy, and report generation."
    );

});

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
