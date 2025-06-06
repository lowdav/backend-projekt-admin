# App för lunchbeställningar

Detta är admin-delen av ett projekt för en lunchrestaurang. Här hanteras menyer och förbeställningar.

---

## Installation

1. Klona repot

2. Installera beroenden:
   ```bash
   npm install
   ```

4. Starta:
   ```bash
   npm run start  #starta för dev
   npm run build  #bygg filer för produktion
   ```

---


## Funktioner

- **Inloggning** för admin (via användarnamn och lösenord)
- **Skapa, redigera och ta bort** menyobjekt per vecka
- **Visa och ta bort eller ange som avhämtad** förbeställningar
- **JWT-token** hanteras och sparas i localStorage

---

## Strukturella filer

| Fil              | Beskrivning                              |
|------------------|------------------------------------------|
| `index.html`     | Inloggningssida                          |
| `admin.html`     | Hantering av veckomeny                   |
| `preorders.html` | Hantering av förbeställningar            |
| `js/admin.js`    | Logik för menyhantering                  |
| `js/preorders.js`| Logik för att visa förbeställningar      |
| `js/index.js`    | Inloggningslogik                         |
| `js/config.js`   | Innehåller `server_url` till API         |
| `js/checktoken.js` | Funktioner för token  |
| `js/check_auth.js` | Funktioner för token  |
| `style.css`      | Gemensam stil för alla sidor             |

---



## Författare

dalo2101
