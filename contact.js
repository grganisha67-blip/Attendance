const form = document.getElementById("contactForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let message = document.getElementById("message").value.trim();

    // 1. Purano validation code
    if(name==="" || email==="" || subject==="" || message===""){
        alert("Please fill all fields.");
        return;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if(!email.match(emailPattern)){
        alert("Enter a valid email.");
        return;
    }

    // 2. Backend (PHP) ma message save garne
    try {
        const response = await fetch("backend/contact.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject, message })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert(result.message);
            form.reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Server error! Make sure XAMPP is running.");
    }

});
