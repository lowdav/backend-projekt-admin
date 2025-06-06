import { server_url } from "./config.js";
import { checkToken} from "./checktoken.js";
import { removeToken } from "./checktoken.js";

//Variabler för globalt scope
let preorderContainer;
let alertbox, logoutLink;
let currentWeek = null;

//Kollar om giltig token finns, hämtar element fråm DOM, sätter eventlyssnare på knappen
//för att ladda förbeställningar
document.addEventListener("DOMContentLoaded", () => {
  checkToken();
  preorderContainer = document.getElementById("preorders");
  alertbox = document.getElementById("alertbox");

  document.getElementById("loadWeekBtn").addEventListener("click", () => {
    const week = parseInt(document.getElementById("weekFilter").value);
    alertbox.textContent = "";
    if (!week || week < 1 || week > 53) {
      alertbox.textContent = "Ange ett giltigt veckonummer (1-53).";
      return;
    }
    currentWeek = week;
    loadPreorders(week);
  });

  //Eventlyssnare för att logga ut + och ta bort token + skicka till startsidan
    logoutLink = document.getElementById('logout-link').addEventListener('click', function (e) {
    e.preventDefault();
    removeToken();
    }
  );
});

//ladda förbeställnignar 
async function loadPreorders(weekNumber) {
    const token = localStorage.getItem("auth_token");
  try {
    const response = await fetch(`${server_url}api/preorders?week=${weekNumber}`, 
    {headers: {
    "Authorization": "Bearer " + token
  }
  });
    const data = await response.json();

    if (response.ok) {
      if (data.preorders.length === 0) {
        preorderContainer.innerHTML = "<p id='no-preorders'>Inga förbeställningar för vald vecka.</p>";
      } else {
        // console.log(data.preorders);
        showPreorders(data.preorders);
        alertbox.textContent = data.message || "Förbeställningar hämtade."
      }
    } else {
      alertbox.textContent = data.error || "Kunde inte hämta förbeställningar.";
    }
  } catch (error) {
    console.error("Fel vid hämtning:", error);
    alertbox.textContent = "Tekniskt fel vid hämtning.";
  }
}

//Visa förbeställningar 
function showPreorders(preorders) {
  preorderContainer.innerHTML = "";

  if (preorders.length === 0) {
    preorderContainer.innerHTML = `<p id="no-menu-items">Inga förbeställningar för denna vecka</p>`;
    return;
  }

  // Ordning på veckodagarna för sortering
  const weekdayOrder = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
  
  // Sortera
  preorders.sort((a, b) => {
    const dayDiff = weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday);
    if (dayDiff !== 0) return dayDiff;
    return a.pickupTime.localeCompare(b.pickupTime);
  });

  preorders.forEach((order) => {
    const preorderWrapper = document.createElement("div");
    preorderWrapper.classList.add("preorder");

    const leftDiv = document.createElement("div");
    leftDiv.classList.add("left-div");

    const rightDiv = document.createElement("div");
    rightDiv.classList.add("right-div");

    const day = document.createElement("p");
    day.textContent = order.weekday;

    const dish = document.createElement("p");
    dish.textContent = order.dishName || "Okänd rätt";

    const name = document.createElement("p");
    name.textContent = order.customerName;

    const email = document.createElement("p");
    email.textContent = order.email;

    const time = document.createElement("p");
    time.textContent = `Kl. ${order.pickupTime}`;

    const status = document.createElement("p");
    status.textContent = order.pickedUp ? "Hämtad" : "Ej hämtad";

    const updateStatus = document.createElement("a");
    updateStatus.href = "#";
    updateStatus.textContent = order.pickedUp ? "Ändra till ej hämtad" : "Markera som hämtad";
    updateStatus.dataset.id = order._id;
    updateStatus.addEventListener("click", (e) => {
      e.preventDefault();
      updatePickedUpStatus(order._id, !order.pickedUp);
    });

    const deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.textContent = "Radera beställningen";
    deleteLink.dataset.id = order._id;
    deleteLink.addEventListener("click", (e) => {
      e.preventDefault();
      deletePreorder(order._id);
    });

    leftDiv.append(day, time, dish, status);
    rightDiv.append(name, email, updateStatus, deleteLink);

    preorderWrapper.append(leftDiv, rightDiv);

    preorderContainer.append(preorderWrapper);
    
  });
}

//Ändra status på förbeställning

async function updatePickedUpStatus(orderId) {
  const token = localStorage.getItem("auth_token");
  try {
    const response = await fetch(`${server_url}api/preorders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await response.json();

    if (response.ok) {
      alertbox.textContent = data.message || "Status uppdaterad.";
      loadPreorders(currentWeek);
    } else {
      alertbox.textContent = data.error || "Kunde inte uppdatera status.";
    }
  } catch (error) {
    console.error("Fel vid statusuppdatering:", error);
    alertbox.textContent = "Tekniskt fel vid uppdatering.";
  }
}

//Radera förbeställning

async function deletePreorder(orderId) {
  const token = localStorage.getItem("auth_token");

  if (!confirm("Vill du verkligen radera denna beställning?")) return;

  try {
    const response = await fetch(`${server_url}api/preorders/${orderId}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await response.json();

    if (response.ok) {
      alertbox.textContent = data.message || "Beställning raderad.";
      loadPreorders(currentWeek);
    } else {
      alertbox.textContent = data.error || "Kunde inte radera beställningen.";
    }
  } catch (error) {
    console.error("Fel vid radering:", error);
    alertbox.textContent = "Tekniskt fel vid radering.";
  }
}

