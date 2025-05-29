import { server_url } from "./config.js";

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
            statusBox.innerHTML = 'Du är inloggad och kan gå till <a href="admin.html">adminsidan</a>';
            console.log("showStatus: tokenIsValid = ", tokenIsValid);

        } else {
            statusBox.innerHTML = "Inte inloggad";
            console.log("showStatus: tokenIsValid = ", tokenIsValid);
        }
    };



//Funktion för att kolla om token är giltig
async function isTokenValid() {
    //kollar om det finns en token med rätt namn i localstorage
    const token = localStorage.getItem("auth_token");
    if (!token) {
        console.log("Ingen token hittades")
        return false;
    }
  //anropar backend route för kontrollen
    try {
      const response = await fetch(`${server_url}api/auth`, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      //Returnera true om serverkollen av token blev godkänd
      console.log("token giltig");
      return response.ok;
      
    } catch {
        //vid fel skicka tillbaka false
        console.log("token ogiltig");
      return false;
    }
  }









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
            statusBox.innerHTML = 'Du är inloggad och kan gå till <a href="admin.html">adminsidan</a>';
            loginForm.reset();
        } else {
            infoBox.innerHTML = data.error;
        }

    } catch (error) {
        console.log("Tekniskt fel: ", error.message);
        infoBox.innerHTML = "Tekniskt fel vid inloggning";
    }
};