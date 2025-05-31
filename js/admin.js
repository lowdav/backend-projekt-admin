import { server_url } from "./config.js";
import { isTokenValid } from "./check_auth.js";

// skapar variabler i globalt scope 
let alertbox;
//Hålla koll på vilken post som är aktuell för ändring/radering
let currentId = null;

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
    alertbox.textContent="Ange ett giltigt veckonummer mellan 1 och 53.";
    return;
  }

  const selectedWeek = document.getElementById("selectedWeek");
  selectedWeek.textContent = `- vecka ${weekNumber}`;
  loadMenuForWeek(weekNumber);
});

//Ladda ev befintlig veckomeny för vald vecka
async function loadMenuForWeek(weekNumber) {
//Rensa formulärdata utom veckonummer, om det finns sedan tidigare
    resetForm();

  try {
    const response = await fetch(
      `${server_url}api/menuitems?week=${weekNumber}`
    );
    const data = await response.json();

    if (response.ok) {
      showMenuItems(data.menu);
      alertbox.textContent= data.message || "Meny hämtad."
    } else {
      alertbox.textContent= data.error || "Meny kunde inte hämtas.";
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
    container.innerHTML = `<p id="no-menu-items">Inga maträtter finns sparade för denna vecka</p>`;
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

    const selectedBanner = document.createElement("p");
    selectedBanner.textContent = "Vald för redigering";
    selectedBanner.classList.add("selected-banner", "hidden");

    const name = document.createElement("p");
    name.textContent = item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    dishWrapper.appendChild(selectedBanner);
    dishWrapper.appendChild(name);
    dishWrapper.appendChild(description);
    
    wrapper.appendChild(day);
    wrapper.appendChild(dishWrapper);
    
    container.appendChild(wrapper);

    //gör hela wrappern klickbar, för att hantera ändringar
    //tar bort klassen selected om den finns
    //lägger till hidden på selected-banner
    wrapper.addEventListener("click", () => {
        document.querySelectorAll(".menu-item").forEach((el) => {
            el.classList.remove("selected");
            el.querySelector(".selected-banner")?.classList.add("hidden");
        });
        //lägger till klassen selected och går vidare till funktionen
        //tar bort hidden på selectedbanner
    wrapper.classList.add("selected");
    wrapper.querySelector(".selected-banner")?.classList.remove("hidden");
    fillFormForEdit(item);
  });
  });
}


//Spara maträtt i databasen

document.getElementById("weeklyMenu").addEventListener("submit", async (e) => {
  e.preventDefault();

  const weekNumber = parseInt(document.getElementById("weekNumber").value);
  const weekday = document.getElementById("weekday").value;
  const name = document.getElementById("dish_name").value.trim();
  const description = document.getElementById("dish_description").value.trim();

  // Validering – alla fält krävs
  if (!weekNumber || weekNumber < 1 || weekNumber > 53) {
    alertbox.textContent = "Ange ett giltigt veckonummer (1-53).";
    return;
  }

  if (!weekday) {
    alertbox.textContent = "Välj en veckodag.";
    return;
  }

  if (!name) {
    alertbox.textContent = "Fyll i maträttens namn.";
    return;
  }

  if (!description) {
    alertbox.textContent = "Fyll i en beskrivning.";
    return;
  }

  const newDish = {
    weekNumber,
    weekday,
    name,
    description
  };

  //För att hantera POST eller PUT och slippa all kod igen, samt samma knapp anropar bara en fuktion oavsett

  let urlEnd = "api/menuitems";
  let currentMethod = "POST";

if (currentId) {
    urlEnd = `api/menuitems/${currentId}`;
    currentMethod = "PUT";
}


  try {
    const response = await fetch(`${server_url}${urlEnd}`, {
      method: currentMethod,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newDish)
    });

    const data = await response.json();

    if (response.ok) {
      alertbox.textContent = data.message || "Maträtten har sparats.";
      document.getElementById("weeklyMenu").reset(); // rensa formuläret
      document.getElementById("deleteBtn").style.display = "none"; //dölj radera-knapp
      loadMenuForWeek(weekNumber); // uppdatera listan
      
    } else {
      alertbox.textContent = data.error || "Kunde inte spara maträtten.";
    }
  } catch (err) {
    console.error("Fel - gick inte att spara:", err);
    alertbox.textContent = "Tekniskt fel - gick inte att spara.";
  }
});


function fillFormForEdit(item) {
    currentId = item._id;

    document.getElementById("weekNumber").value = item.weekNumber;
    document.getElementById("weekday").value = item.weekday;
    document.getElementById("dish_name").value = item.name;
    document.getElementById("dish_description").value = item.description;
    //Visa radera-knapp
    document.getElementById("deleteBtn").style.display = "block";

    alertbox.textContent = "Du kan nu redigera och spara eller radera.";
};


//Eventlyssnare + funktionalitet för radering 

document.getElementById("deleteBtn").addEventListener("click", async () => {
  if (!currentId) return;

  const confirmDelete = confirm("Vill du verkligen radera maträtten?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${server_url}api/menuitems/${currentId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("alertbox").textContent = data.message || "Maträtten raderades.";
      // Rensa formuläret förutom veckonummer
      resetForm();
      currentId = null;

      // Uppdatera listan
      loadMenuForWeek(document.getElementById("weekNumber").value);
    } else {
      alertbox.textContent = data.error || "Radering misslyckades.";
    }
  } catch (err) {
    console.error("Fel vid radering:", err);
    alertbox.textContent = "Tekniskt fel vid radering.";
  }
});

//funktion för att radera formulärdata utom vekonummer och dölja raderaknappen
function resetForm() {
        document.getElementById("dish_name").value = "";
        document.getElementById("dish_description").value = "";
        document.getElementById("weekday").value = "";
        document.getElementById("deleteBtn").style.display = "none";
}