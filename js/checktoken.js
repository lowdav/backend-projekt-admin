import { isTokenValid } from "./check_auth.js";

//Kollar om token är giltig och skickar annars användaren till startsidan
async function checkToken() {
  const valid = await isTokenValid();
  if (!valid) {
    removeToken();
    window.location.href = "index.html";
}}

//Tar bort token och skickar till login-sidan
function removeToken() {
  localStorage.removeItem("auth_token");
  window.location.href = "index.html";
}
export {checkToken};
export {removeToken};