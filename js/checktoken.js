import { isTokenValid } from "./check_auth.js";

//Kollar om token är giltig och skickar annars användaren till startsidan
async function checkToken() {
  const valid = await isTokenValid();
  if (!valid) window.location.href = "index.html";
}

export {checkToken};