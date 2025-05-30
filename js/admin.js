import { server_url } from "./config.js";
import { isTokenValid } from "./check_auth.js";

let alertbox;

//kolla om giltig token finns vid sidladdning, annars skicka till startsidan
document.addEventListener("DOMContentLoaded", () => {
  async function checkToken() {
    const tokenIsValid = await isTokenValid();

    if (!tokenIsValid) {
      window.location.href = "index.html";
    }
    alertbox = document.getElementById("alertbox");
  }
  checkToken();
});

//eventlyssnare för att ladda veckomenyn
document.getElementById("loadWeekBtn").addEventListener("click", () => {
  const weekInput = document.getElementById("weekNumber").value;
  const weekNumber = parseInt(weekInput);

  if (!weekNumber || weekNumber < 1 || weekNumber > 53) {
    alert("Ange ett giltigt veckonummer mellan 1 och 53.");
    return;
  }

  loadMenuForWeek(weekNumber);
});

//Ladda ev befintlig veckomeny för vald vecka
async function loadMenuForWeek(weekNumber) {
  try {
    const response = await fetch(
      `${server_url}api/menuitems?week=${weekNumber}`
    );
    const data = await response.json();

    if (response.ok) {
      showMenuItems(data.menu);
      alertbox.textContent="Veckomeny hämtad."
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Fel vid hämtning:", err);
    alertbox.textContent="Tekniskt fel vid hämtning av meny.";
  }
}

//Skriv ut meny till skärmen

function showMenuItems(menuItems) {
  const container = document.getElementById("currentMenu");
  container.innerHTML = "";

  if (menuItems.length === 0) {
    container.innerHTML = "<p>Inga maträtter finns sparade för denna vecka</p>";
  }
//Ordning på veckodagarna, för sortering
    const weekdayOrder = [
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
    "Söndag"
  ];

  // Sortera enligt veckodagsordning
  menuItems.sort((a, b) => {
    return (
      weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
    );
  });
  //Loopa igenom och skriv ut
  menuItems.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("menu-item");
    wrapper.dataset.id = item._id;

    const day = document.createElement("p");
    day.textContent = item.weekday;

    const dishWrapper = document.createElement("div");
    dishWrapper.classList.add("dish-content");

    const name = document.createElement("p");
    name.textContent = item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    dishWrapper.appendChild(name);
    dishWrapper.appendChild(description);
    
    wrapper.appendChild(day);
    wrapper.appendChild(dishWrapper);
    
    container.appendChild(wrapper);

    //gör hela wrappern klickbar, för att hantera ändringar
    wrapper.addEventListener("click", () => fillFormForEdit(item));
  });

}

//Spara maträtt i databasen

document.getElementById("weeklyMenu").addEventListener("submit", async (e) => {
  e.preventDefault();

  const alertBox = document.getElementById("alertbox");
  alertBox.innerHTML = ""; 

  const weekNumber = parseInt(document.getElementById("weekNumber").value);
  const weekday = document.getElementById("weekday").value;
  const name = document.getElementById("dish_name").value.trim();
  const description = document.getElementById("dish_description").value.trim();

  // Validering – alla fält krävs
  if (!weekNumber || weekNumber < 1 || weekNumber > 53) {
    alertBox.textContent = "Ange ett giltigt veckonummer (1-53).";
    return;
  }

  if (!weekday) {
    alertBox.textContent = "Välj en veckodag.";
    return;
  }

  if (!name) {
    alertBox.textContent = "Fyll i maträttens namn.";
    return;
  }

  if (!description) {
    alertBox.textContent = "Fyll i en beskrivning.";
    return;
  }

  const newDish = {
    weekNumber,
    weekday,
    name,
    description
  };

  try {
    const response = await fetch(`${server_url}api/menuitems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newDish)
    });

    const result = await response.json();

    if (response.ok) {
      alertBox.textContent = "Maträtten har sparats.";
      loadMenuForWeek(weekNumber); // uppdatera listan
      document.getElementById("weeklyMenu").reset(); // rensa formuläret
    } else {
      alertBox.textContent = "Kunde inte spara maträtten.";
    }
  } catch (err) {
    console.error("Fel - gick inte att spara:", err);
    alertBox.textContent = "Tekniskt fel - gick inte att spara.";
  }
});


