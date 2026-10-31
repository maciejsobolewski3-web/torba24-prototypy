# Printbag24 — Soft glass

Publiczna, interaktywna prezentacja sklepu: https://maciejsobolewski3-web.github.io/torba24-prototypy/

Wybrany kierunek Soft glass, nazwa printbag24.pl i logo przekazane przez klienta. Domena printbag24.pl nie jest podłączona; publikacja korzysta z istniejącego GitHub Pages.

## Widoki

- `/` i `/glassy/` — nowa strona główna.
- `/catalog/` — katalog; materiał, kolor, format, uchwyt, wykończenie, gramatura, wyszukiwarka i sortowanie.
- `/product/?id=kraft` — karta modelu z parametrami i przejściem do konfiguratora.
- `/creator/` — lokalny podgląd PNG/JPG/SVG, położenie nadruku myszą lub klawiaturą, wielkość, kolor tekstu, strona torby, zapis projektu i koszyk demonstracyjny.
- `/projects/` — jawnie oznaczone wizualizacje poglądowe z przejściem do zapytania.
- `/how-to/` — proces, przygotowanie plików, wycena/dostawa i FAQ.
- `/contact/` — zapytanie pobierane jako lokalny plik TXT. Bez wysyłki do firmy.
- `/concepts/` — archiwum sześciu kierunków; stare adresy `/silver/`, `/dark/`, `/organic/` nadal działają.

## Zakres prezentacji

Produkty, grafiki produktowe, wymiary i gramatury są przykładowe. Nie są potwierdzoną ofertą. Brak prawdziwych cen, płatności, zamówień i kontaktu serwerowego. Dane firmy, cennik, minimalne nakłady, terminy i rzeczywiste realizacje wymagają uzupełnienia przed uruchomieniem sprzedaży.

Wgrane logo nie opuszcza przeglądarki i nie jest zapisywane w localStorage. Zapis projektu i koszyk zachowują ustawienia, nie plik; po ponownym otwarciu trzeba dodać logo. Formularz kontaktowy pobiera plik lokalnie — niczego nie wysyła.

## Uruchomienie

Statyczne HTML/CSS/JS, bez kompilacji i zależności:

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

`app.js` zawiera nawigację, katalog i studio. `printbag-content.js` zawiera nowe podstrony, przykładowe parametry oraz eksport zapytania. `printbag.css` rozwija istniejący system `styles.css`. Logo jest niezmienionym plikiem klienta, kadrowanym wizualnie przez CSS. Fonty Manrope i DM Sans są pobierane z Google Fonts.

## Motion

- Naciśnięcie przycisku: 140 ms, skala 0.97.
- Pokaz nadruku w hero: 600 ms, przezroczystość, wyłącznie po interakcji.
- Wgranie logo: 200 ms, przezroczystość; bez animowania przesuwania nadruku.
- Okna: 240 ms. Obsługa `prefers-reduced-motion` i dotyku.

## Walidacja 2026-10-31

Sprawdzono w przeglądarce układ komputerowy oraz szerokości 390 i 360 px, menu mobilne, animację pokazu nadruku, konfigurację materiał/kolor, filtr uchwytu, kartę modelu, przekazanie nakładu 137 szt., wgranie PNG, edycję tekstu i klawiaturą, stronę nadruku, podsumowanie, koszyk i powrót do edycji, przekazanie konfiguracji do zapytania, pobranie TXT, FAQ i wybór inspiracji. Brak błędów konsoli w sprawdzonych ścieżkach. Sprawdzono składnię JS i diff whitespace.
