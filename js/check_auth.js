import { server_url } from "./config.js";

//Funktion för att kolla om token är giltig
export async function isTokenValid() {
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

      console.log("Svar vid tokenkontroll: ", response.status);
      
      if (response.ok) {
      //Returnera true om serverkollen av token blev godkänd
      console.log("Token giltig");
      return response.ok;
      } else {
        console.log("Token ogiltig");
        return false;
      }
    } catch (error) {
        //vid fel skicka tillbaka false
        console.log("Tokenkontroll misslyckades: ", error);
      return false;
    }
  }