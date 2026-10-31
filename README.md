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

## Animowany proces

Sekcja „Od pustej torby do Twojej marki” korzysta z `process-motion.js` i `process-motion.css`. Pokazuje wybór materiału, dodanie logo, akceptację oraz gotową serię z paczką. Sekwencja trwa 16 sekund, odtwarza się raz po wejściu w obszar widoczny i ma pauzę, powtórzenie oraz ręczny wybór etapów (także strzałkami klawiatury). Zmiana karty lub opuszczenie sekcji zatrzymuje zegar. Przy `prefers-reduced-motion` nie ma automatycznego startu, a efekty przestrzenne nie są animowane. To responsywna animacja HTML/CSS/JS, nie osadzony film MP4.

## Interakcje produktu

- Hero: lokalny podgląd własnego PNG/JPG/SVG na papierze i bawełnie, zmiana oraz usuwanie pliku. Animacja przeniesienia znaku na materiał. Na telefonie podgląd przewija się w obszar widoczny po wgraniu.
- Przejście z hero do studia zachowuje plik w pamięci, materiał, kolor i nakład. Plik nie trafia do localStorage ani na serwer. Odświeżenie dokumentu wymaga ponownego dodania logo.
- `logo-file.js` waliduje rozmiar i typ, oczyszcza SVG i sprawdza dekodowanie obrazu. Błędny plik nie zastępuje działającego podglądu.
- Inspiracje: nadruk pojawia się na hover i po kliknięciu/dotknięciu; przyciski mają stan aria-pressed i działają klawiaturą.
- Karty modeli: przycisk „Sprawdź rozmiar” odsłania schemat wymiarów korpusu. Papier ma szerokość/głębokość/wysokość, bawełna szerokość/wysokość. Dane nadal są jawnie przykładowe.
- Nowe interakcje znajdują się w `product-interactions.js` i `product-interactions.css`; respektują ograniczenie ruchu.

Sprawdzono PNG, przezroczyste SVG, uszkodzony PNG (zachowanie wcześniejszego logo), przekazanie pliku i nakładu 137 szt. do studia, edycję i podsumowanie po przejściu, przełączanie inspiracji oraz schemat bawełny i papieru. Widoki mobilne sprawdzone przy 390 px.


### Dopracowanie interfejsu — 31.10.2026

- Równe segmenty Papier/Bawełna, panel o wysokości wynikającej z treści i pełnej szerokości pola na telefonie.
- Rozdzielona kompozycja papieru i bawełny, również po wgraniu własnego logo; zachowany ruch przy wyborze materiału.
- Usunięte ozdobne strzałki z CTA, kart i etapów procesu. Samodzielne linki zastąpione etykietami Zobacz/Edytuj.
- Sekcja hero używa overflow:clip, aby jej dekoracja nie tworzyła wewnętrznego obszaru przewijania przy ustawianiu fokusu.
- Sprawdzone w przeglądarce: 390, 820, 1280 i 1440 px, równe segmenty, brak poziomego przepełnienia, zmiana materiału, podgląd nadruku, upload SVG i przeniesienie do studia, wymiary produktu, ręczny wybór etapu animacji. Konsola bez błędów JS.
- Zakres oferty i specyfikacje pozostają przykładowe. Analiza konkurencji nie stanowi potwierdzenia asortymentu Printbag24.


### Studio 3D — pierwszy model papierowy (31.10.2026)

- Nowy adres `studio-3d/`, połączony ze stroną główną i kartą Papier premium. Klasyczny konfigurator pozostaje dostępny.
- Proceduralna, otwarta bryła torby z bocznymi zakładkami, wewnętrznym zagięciem papieru, dnem, oczkami i plecionymi sznurkowymi uchwytami. Geometria pokazowa, nie zweryfikowany model produkcyjny.
- Three.js 0.187.0 (MIT), pliki z oficjalnego pakietu npm w `vendor/three/`; licencja zachowana. Brak CDN dla silnika 3D i brak kroku budowania.
- Trzy kolory; kamera przód/tył/detal/cała torba, ręczny obrót, opcjonalna rotacja; osobne projekty obu stron; upload PNG/JPG/SVG do 5 MB poprzez wspólny walidator.
- Logo nakładane na UV powierzchni. Skala i przesunięcie ograniczone do poglądowego obszaru. Przeciąganie nadruku myszką; suwaki dostępne klawiaturą i na telefonie. Przykładowy napis dostosowuje kolor do papieru; kolory wgranego logo pozostają zachowane.
- PNG zawiera aktualny kadr i oznaczenie podglądu. To obraz prezentacyjny, nie plik produkcyjny. Logo pozostaje wyłącznie w pamięci bieżącej strony; nie jest wysyłane ani zapisywane między wizytami.
- Renderowanie na żądanie, limit pixel ratio 1.75, zatrzymanie poza ekranem / w tle, obsługa reduced motion i awarii WebGL z linkiem do klasycznego konfiguratora.
- QA w przeglądarce: render WebGL na desktopie i układ mobilny (433 CSS px), brak poziomego przepełnienia; trzy kolory; przód/tył/detal; rotacja start/stop; przeciąganie nadruku i suwaki; wgranie SVG na tył z zachowaniem przodu; odrzucenie uszkodzonego PNG bez utraty nadruku; usunięcie/przywrócenie przykładu; pobranie i wizualna inspekcja PNG; przejście z hero do studia. Wydajność na fizycznym telefonie i fallback WebGL nie były osobno emulowane.
