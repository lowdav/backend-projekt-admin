import { server_url } from "./config.js";
import { isTokenValid } from "./check_auth.js";

let infoBox;
let statusBox;

//Körs när DOM laddat klart
document.addEventListener("DOMContentLoaded", function() {
    
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", loginUser);

    infoBox = document.getElementById("infobox");
    statusBox = document.getElementById("status");

    console.log("statusBox är:", statusBox);


    showStatus();
});



//kollar efter giltig token och visar status i statusBox

async function showStatus() {
        const tokenIsValid = await isTokenValid();

        if (tokenIsValid) {
            statusBox.innerHTML = 'Du är redan inloggad och kan gå till <a href="admin.html">adminsidan</a>';
            console.log("showStatus: tokenIsValid = ", tokenIsValid);

        } else {
            statusBox.innerHTML = "Inte inloggad";
            console.log("showStatus: tokenIsValid = ", tokenIsValid);
        }
    };


//Logga in användare
async function loginUser(e) {
    e.preventDefault();

    let userNameInput = document.getElementById("username").value;
    let userPasswordInput = document.getElementById("password").value;

    if(!userNameInput || !userPasswordInput) {
        console.log("Fyll i alla fält");
        infoBox.innerHTML="Fyll i alla fält";
        return;
    }

    let user = {
        username: userNameInput,
        password: userPasswordInput
    }

    try {
        const response = await fetch(`${server_url}api/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if(response.ok) {    
            console.log("Här kommer data: ", data);
            localStorage.setItem("auth_token", data.token);
            window.location.href="admin.html";
        } else {
            infoBox.innerHTML = data.error || "Felaktiga inloggningsuppgifter";
        }

    } catch (error) {
        console.log("Tekniskt fel: ", error.message);
        infoBox.innerHTML = "Tekniskt fel vid inloggning";
    }
}