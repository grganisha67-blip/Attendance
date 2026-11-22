window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get("role");

    if (roleFromUrl) {
        const roleSelect = document.getElementById("role");
        const roleLabel = document.getElementById("role-label");
        const subtitle = document.getElementById("login-subtitle");

        roleSelect.value = roleFromUrl;           
        roleSelect.style.display = "none";        
        if (roleLabel) roleLabel.style.display = "none"; 

        if (subtitle) {
            subtitle.innerText = roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1) + " Login";
        }
    }
});


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

document.getElementById("loginForm").addEventListener("submit", async function(event){

    event.preventDefault();

    let role = document.getElementById("role").value;
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("message");

    if(role === "" || email === "" || password === ""){
        message.style.color = "red";
        message.innerHTML = "Please fill in all fields and select a role.";
        return;
    }

    try {
        const response = await fetch("backend/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password, role: role })
        });

        const result = await response.json();

        if (result.status === "success") {
            message.style.color = "green";
            message.innerHTML = "Login Successful!";

            localStorage.setItem("user_id", result.user_id);
            localStorage.setItem("user_name", result.name);
            localStorage.setItem("user_role", result.role);

            setTimeout(function(){
                if (result.role === "admin") {
                    window.location.href = "admin.html";
                } else if (result.role === "teacher") {
                    window.location.href = "teacher.html";
                } else {
                    window.location.href = "student.html";
                }
            }, 1000);
        } else {
            message.style.color = "red";
            message.innerHTML = result.message;
        }
    } catch (error) {
        message.style.color = "red";
        message.innerHTML = "Backend server sanga connect huna sakena!";
    }

});
