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
      //Returnera true om serverkollen av token blev godkänd
      console.log("token giltig");
      return response.ok;
      
    } catch {
        //vid fel skicka tillbaka false
        console.log("token ogiltig");
      return false;
    }
  }