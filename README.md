# Projekt i kursen DT193G, Fullstack-utveckling med ramverk

## Frontend
Detta är front-delen av ett lagerhanteringssytem som utvecklats som en del av ett fullstack-projekt.
Applikationen är byggd i Vue och fungerar som användargränssnittet mot ett REST-API som hanterar produkter, varianter, lagersaldo och användare.

## Funktioner i applikationen

### Inloggning och roller
Applikationen innehåller ett inloggningssystem baserat på JWT-token, där användaren får tillgång till olika funktioner beroende på sin roll. Administratörer har full åtkomst till alla delar av systemet, medan lagerpersonal endast ser de funktioner som är relevanta för deras arbete.

### Produkthantering
Systemet gör det möjligt att visa en komplett lista över produkter och öppna en detaljerad vy för varje produkt. Administratörer kan redigera produktinformation, ladda upp nya produkter samt produktbilder och ta bort produkter vid behov.

### Varianthantering
För varje produkt kan användaren se alla tillhörande varianter, exempelvis olika storleker, priser och lagersaldo. Lagerpersonal kan uppdatera lagersaldo direkt i sidan, medan administratörer har behörighet för att lägga till nya varianter, redigera och radera de befintliga.

### Användarhantering
Administratörer har dessutom tillgång till användarhantering, där de kan skapa nya användare, redigera befintliga och tilldela roller.

### Profilredigering
Både lagerpersonal och administratörer har möjlighet att redigera sina egna uppgifter, såsom förnamn, efternamn, e-post och lösenord.

#### Tommy Issa, tois2401