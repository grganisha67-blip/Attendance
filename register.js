function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    const eyeOpen = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeOff = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    if (input.type === "password") {
        input.type = "text";
        iconElement.innerHTML = eyeOff;
    } else {
        input.type = "password";
        iconElement.innerHTML = eyeOpen;
    }
}

function handleRoleChange() {
    const role = document.getElementById("role").value;
    const secretBox = document.getElementById("secretCodeBox");
    const studentFields = document.getElementById("studentFields");

    if (role === "admin" || role === "teacher") {
        secretBox.style.display = "block";
        studentFields.style.display = "none";
    } else {
        secretBox.style.display = "none";
        studentFields.style.display = "block";
    }
}

document.getElementById("registerForm").addEventListener("submit", async function(event){

    event.preventDefault();

    let role = document.getElementById("role").value;
    let secretCode = document.getElementById("secretCode") ? document.getElementById("secretCode").value.trim() : "";
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let faculty = (role === "student") ? document.getElementById("faculty").value : "N/A";
    let semester = (role === "student") ? document.getElementById("semester").value : "N/A";
    let username = email;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let message = document.getElementById("message");

    if(role==="" || name==="" || email==="" || password==="" || confirmPassword===""){
        message.style.color="red";
        message.innerHTML="Please fill in all required fields.";
        return;
    }

    if (role === "admin" && secretCode !== "ADMIN123") {
        message.style.color = "red";
        message.innerHTML = "Invalid Admin Secret Code!";
        return;
    }

    if (role === "teacher" && secretCode !== "TEACHER123") {
        message.style.color = "red";
        message.innerHTML = "Invalid Teacher Secret Code!";
        return;
    }

    if(role === "student" && (faculty === "" || semester === "")){
        message.style.color="red";
        message.innerHTML="Please select Faculty and Semester.";
        return;
    }

    if(password !== confirmPassword){
        message.style.color="red";
        message.innerHTML="Passwords do not match.";
        return;
    }

    try {
        const response = await fetch("backend/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, secretCode, name, email, faculty, semester, username, password })
        });

        const text = await response.text();
        console.log("Server Response:", text);
        const result = JSON.parse(text);

        if (result.status === "success") {
            message.style.color = "green";
            message.innerHTML = result.message;

            setTimeout(function(){
                window.location.href = "login.html";
            }, 2000);
        } else {
            message.style.color = "red";
            message.innerHTML = result.message;
        }
    } catch (error) {
        message.style.color = "red";
        message.innerHTML = "Error: " + error.message;
    }

});
