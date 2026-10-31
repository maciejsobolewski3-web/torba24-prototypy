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

Produkty, grafiki produktowe, wymiary i gramatury są przykładowe. Nie są potwierdzoną ofertą. Brak prawdziwych cen, płatności, zamówień i kontaktu serwerowego. Nowy proces zakupowy korzysta z jawnie oznaczonego przykładowego cennika brutto. Dane firmy, cennik, minimalne nakłady, terminy i rzeczywiste realizacje wymagają uzupełnienia przed uruchomieniem sprzedaży.

Wgrane logo nie opuszcza przeglądarki. Nowe studio 2D/3D zapisuje pliki i ustawienia obu stron w IndexedDB po kliknięciu „Sprawdź projekt”. Starszy konfigurator `/creator/` zachowuje tylko ustawienia, bez pliku logo. Formularz kontaktowy pobiera plik lokalnie — niczego nie wysyła.

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

Sekcja „Od pustej torby do Twojej marki” korzysta z `process-motion.js` i `process-motion.css`. Pokazuje wybór materiału, dodanie logo, akceptację oraz gotową serię z paczką. Sekwencja trwa 10,4 sekundy (2,6 s na etap) i powtarza się tylko w obszarze widocznym. Ilustracja jest bezpośrednio na tle sekcji, bez ramki, osobnego tła i paska odtwarzacza. Ręczny wybór etapu (także strzałkami klawiatury) zatrzymuje automatyczne przechodzenie i kołysanie toreb; dyskretny link pozwala wznowić pokaz. Zmiana karty lub opuszczenie sekcji zatrzymuje zegar. Przy `prefers-reduced-motion` nie ma automatycznego startu, a efekty przestrzenne nie są animowane. To responsywna animacja HTML/CSS/JS, nie osadzony film MP4.

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
- PNG zawiera aktualny kadr i oznaczenie podglądu. To obraz prezentacyjny, nie plik produkcyjny. Logo nie jest wysyłane. Od wersji flow-6 kliknięcie „Sprawdź projekt” zapisuje plik i ustawienia lokalnie w IndexedDB; koszyk przywraca oba nadruki bez ponownego wgrywania.
- Renderowanie na żądanie, limit pixel ratio 1.75, zatrzymanie poza ekranem / w tle, obsługa reduced motion i awarii WebGL z linkiem do klasycznego konfiguratora.
- QA w przeglądarce: render WebGL na desktopie i układ mobilny (433 CSS px), brak poziomego przepełnienia; trzy kolory; przód/tył/detal; rotacja start/stop; przeciąganie nadruku i suwaki; wgranie SVG na tył z zachowaniem przodu; odrzucenie uszkodzonego PNG bez utraty nadruku; usunięcie/przywrócenie przykładu; pobranie i wizualna inspekcja PNG; przejście z hero do studia. Wydajność na fizycznym telefonie i fallback WebGL nie były osobno emulowane.

## Proces zakupowy 2D / 3D — flow-6

- Zakres: papier premium, poglądowy format 32 × 12 × 26 cm. Pozostałe modele nadal korzystają z klasycznego konfiguratora. Główna akcja na karcie Papier premium prowadzi do nowego studia i przekazuje nakład.
- Studio → sprawdzenie frontu i tyłu → koszyk → dane → potwierdzenie demonstracji. Widok kontrolny zawsze jest na wprost. Nadruk przykładowy jest oznaczony i wymaga świadomego potwierdzenia.
- `order/store.js`: natywny IndexedDB (projekty, koszyk, podsumowania). Zachowuje zwalidowane pliki jako Blob, kolor/preset, oba nadruki, położenie, skalę, ilość i miniatury. SVG przechodzi wspólny sanitizer. Nie zapisujemy tymczasowych blob URL. Od brand-7 dane formularza są przechowywane lokalnie razem z podsumowaniem i dołączane do eksportu JSON.
- Trzy presety kolorów mają cennik DEMO, progi ilości i dopłatę za drugą stronę. Kolor RGB/HEX kieruje do osobnej wyceny. Koszyk mieszany wyklucza pozycje do wyceny z sumy ścieżki zakupowej. Wszystkie kwoty i limity są demonstracyjne.
- Koszyk ma zmianę ilości, niezależną kopię, usuwanie z cofnięciem i powrót do edycji. Zmiany projektu są zatwierdzane na ekranie kontrolnym i aktualizują istniejącą pozycję. Starszy koszyk jest rozpoznawany i ma linki do wcześniejszych projektów.
- Formularz końcowy ma walidację, nie wysyła danych i nie uruchamia płatności. Zakończenie przenosi wyłącznie właściwą grupę projektów do lokalnego podsumowania. Paczkę z plikami i ustawieniami można pobrać jako JSON. Nie jest to plik do druku.
- Produkcja wymaga backendu, zatwierdzonego asortymentu/cennika, trwałego uploadu i repozytorium projektów, integracji płatności, wysyłki zapytań oraz panelu akceptacji proofów. GitHub Pages obsługuje tu wyłącznie demonstrację.

QA: logo SVG na obu stronach, odświeżenie i odtworzenie pliku, zmiana skali tylnego nadruku, aktualizacja bez duplikowania pozycji, niezależna kopia RGB, nakład i progi cen, koszyk mieszany, usunięcie/cofnięcie, walidacja pustego formularza, pełne zakończenie zakupowe i wycenowe, eksport JSON (oba logo, położenie/rozmiar, podglądy; bez danych formularza w wersji flow-6). Układ desktop i mobilny 390 px bez poziomego przepełnienia.

## Wspólna identyfikacja EASOLUTION — brand-7

- `brand-shell.js` i `brand-shell.css` dostarczają wspólny pasek serwisów, dwa logotypy, stopkę i stronę `/nasza-historia/`. Działają na stronie sklepu, w studiu oraz w koszyku. Na telefonie serwisy są rozwijane natywnym elementem details.
- Logo EASOLUTION, znaki płatności, dane firmy, telefony i adresy serwisów pochodzą z https://zamowdruk.pl/ (sprawdzone 31.10.2026). Historia jest opracowana na podstawie https://zamowdruk.pl/nasza-historia. Zielono-srebrny styl Printbag24 pozostaje własny.
- Regulamin, prywatność, reklamacje, poradniki i program lojalnościowy prowadzą do istniejących stron zamowdruk.pl; ich opisy linków wskazują serwis docelowy. Nie utworzono nowych dokumentów prawnych.
- Interfejs sklepu ma docelowe teksty bez etykiet demo. Ceny pozostają szacunkową wyceną; płatność nie jest podłączona. Zapis podsumowania nie wysyła zamówienia: klient pobiera paczkę i przekazuje ją na info@easolution.pl. Archiwum koncepcji oraz dokumentacja techniczna nadal opisują prototyp.
- Dane z formularza końcowego (kontakt/adres lub wiadomość) zapisują się lokalnie w IndexedDB w podsumowaniu i trafiają do pobieranego JSON wraz z projektem. Żadne dane nie są automatycznie wysyłane.

QA brand-7: wspólny nagłówek na desktopie i telefonie 390 px, rozwijany pasek marek, mobilna stopka, historia, studio 2D/3D, koszyk, zakończenie formularza na danych testowych, eksport JSON z kontaktem/adresem i dwoma projektami; brak błędów konsoli.

QA motion-8: automatyczne przejście od etapu 1 do 4, ręczny wybór zatrzymuje pokaz, tło przezroczyste i brak kontrolek odtwarzacza, desktop 1440 px oraz telefon 390 px bez poziomego przepełnienia; konsola bez błędów.

Motion-9: większa ekspozycja toreb, delikatne kołysanie, naniesienie nadruku, animowana akceptacja i kaskadowe pojawianie się serii. Animacje respektują reduced motion i zatrzymanie sekcji poza ekranem.

Motion-10: etap „Wybierz bazę” pokazuje dwie duże torby (papier i bawełna) zamiast miniatury w etykiecie. Papier odsuwa się, a bawełna przesuwa na środek przed nadrukiem. Sprawdzono desktop 1440 px, telefon 390 px, przejście do nadruku i brak błędów konsoli.

Motion-11: dekoracyjny kursor wybiera bawełnę (najazd, kliknięcie, impuls i zaznaczenie). Efekty korzystają ze wspólnego zegara pokazu, zatrzymują się poza ekranem i respektują reduced motion. Sprawdzono klatki przed/po kliknięciu, zaznaczenie na telefonie 390 px i brak błędów konsoli.


## Zróżnicowanie strony głównej — editorial-12

- Hero i animacja procesu zachowane. Wybór materiału używa próbek faktur zamiast kolejnych renderów toreb.
- Kolekcja na stronie głównej ma trzy osobne ujęcia produktów; katalog i konfiguratory zachowują dotychczasowe grafiki i geometrię nadruku.
- Inspiracje pokazują pakowanie zakupów w butiku i torbę w mieście. Są koncepcjami wizualnymi, nie realizacjami dla klientów ani potwierdzeniem dostępnych wariantów.
- Pięć nowych grafik wygenerowano wbudowanym image_gen i zoptymalizowano do WebP. Dokładne prompty i nazwy plików: `assets/editorial-prompts.json`.
- QA: desktop 1440 px i telefon 390 px, wczytanie wszystkich nowych grafik, brak poziomego przepełnienia, otwarcie produktu z karty, kategoria papieru i zapytanie z wybranym modelem premium; konsola bez błędów.

## Kolekcja i animowane drzewo historii — history-14

- Home ma jedną kolekcję z filtrami Wszystkie / Papier / Bawełna; usunięto osobny wybór materiału i powtarzające się nagłówki. Hero zachowany.
- `/nasza-historia/`: rosnące drzewo SVG z korzeniami EASOLUTION, pięcioma okresami i sześcioma klikalnymi markami. Treść pochodzi z dotychczasowej historii firmy; pełne daty i technologie pozostają w rozwijanym panelu. Układ gałęzi obrazuje rodzinę marek, nie relacje prawne ani daty powstania każdej z nich.
- Automatyczny pokaz trwa 16 sekund i kończy się w 2026 roku. Ręczny wybór okresu zatrzymuje pokaz; przycisk pozwala wznowić lub odtworzyć od początku. Zegar zatrzymuje się poza widokiem i w nieaktywnej karcie. Reduced motion pokazuje od razu całe drzewo i wyłącza przejścia. Wcześniejsze okresy można nadal wybierać.

QA history-14: przeglądarka 1440 i 390 px; automatyczne zakończenie na 2026, ręczny powrót do 2000 i zatrzymanie, wybór 2019–2025 (dwie marki) oraz wznowienie do 2026 (sześć marek). Filtry kolekcji pokazują odpowiednio trzy, dwa i jeden model. Brak poziomego przepełnienia na telefonie i błędów konsoli. Tryb reduced motion obsłużony w CSS/JS; nie był osobno emulowany w przeglądarce.


History-15: ilustrację dosłownego drzewa zastąpił schemat z połączeniami rysowanymi od góry do dołu. EASOLUTION u góry, marki w trzech rzędach, nowe połączenie Printbag24 wyróżnione zielenią. Bez pnia, liści i korzeni; dotychczasowe sterowanie i okresy zachowane.

## Oś czasu według referencji PrintDTF — history-16

- Historię przedstawia pionowa oś czasu: najnowsze wydarzenia u góry, daty i znaczniki kalendarza pośrodku, karty naprzemiennie po bokach. Zachowane dziewięć okresów i dotychczasowe fakty dotyczące firmy.
- Linia wypełnia się podczas przewijania, karty pojawiają się jednokrotnie po wejściu w widok. Bez automatycznego pokazu i kontrolek odtwarzania. Reduced motion wyłącza przejścia i od razu pokazuje całą linię oraz treść.
- Telefon: oś z datami po lewej, opisy po prawej. QA w przeglądarce: desktop 1440 px i telefon 390 px, dziewięć wydarzeń, wzrost wypełnienia linii i pojawianie się dalszych kart podczas przewijania, brak poziomego przepełnienia i błędów konsoli.

## Nawigacja i nakładka konta — nav-17

- Menu wyśrodkowane względem strony, większe napisy (16–17 px), osobny przycisk konta. Na mniejszych ekranach menu przechodzi do hamburgera, a konto pozostaje dostępne jako ikona. Wspólna nakładka dostępna też w studiu 2D/3D i koszyku.
- Logowanie, rejestracja i reset hasła w natywnym dialogu: walidacja pól i zgodności haseł, pokaż/ukryj hasło, zamykanie Escape oraz powrót fokusu. To interfejs do podłączenia backendu: nie zapisuje ani nie wysyła danych logowania i nie symuluje udanej autoryzacji lub wysłania maila.
- QA: menu wyśrodkowane przy 1440 i 1920 px; telefon 390 i 320 px bez poziomego przepełnienia. Sprawdzone wymagane pola, niezgodne hasła, wszystkie trzy widoki, Escape, koszyk i nagłówek studia. Kontrola składni JS i git diff --check zakończone poprawnie.
