# Printbag24 — katalog, konfiguracja i podłączenie Joomla

Stan audytu i frontu: **31.10.2026**. Referencja: **https://bagpack.pl/** (nie backpack.pl).

## Co sprawdzono

Przejrzano 13 stron kategorii/paginacji i wszystkie **109 kart produktów**. Na każdej otwarto formularz „Złóż zamówienie” i zapisano dostępne selektory oraz specyfikację. Przeklikano format/folię/sznurek i krok nakładu dla laminowanej torby M oraz nadruk jednostronny/dwustronny dla kraftu. Nie wysyłano zamówienia, plików ani formularza kontaktowego do konkurencji.

Pełne dane obserwacyjne, łącznie z oryginalnymi nazwami pól, identyfikatorami źródłowymi, listami formatów i URL każdej karty: `research/bagpack-2026-10-31/observed-options.json`. Zrzut formularza: `research/bagpack-2026-10-31/laminated-configurator.jpg`.

Nie kopiujemy zdjęć, grafik, opisów marketingowych ani cennika konkurencji. W katalogu są własne schematy konstrukcji. To mapa oferty referencyjnej do potwierdzenia przez właściciela Printbag24, nie dowód, że EASOLUTION produkuje już każdy wariant.

## Rodziny i reguły

| Rodzina | Kart | Standardowe parametry |
|---|---:|---|
| Papier laminowany | 5 (S–XXL) | Format z listy właściwej dla grupy; kreda mat 170 g; CMYK 4/0; folia mat/błysk; 24 kolory sznurka |
| Papier kraft premium (referencja PREMIUM eko+) | 5 (S–XXL) | Osobne listy formatów; kraftliner brąz 170 g; jeden kolor; 5 kolorów sznurka; bez selektora laminacji |
| Kraft z papierowym uchwytem | 43 | Gotowy wariant rozmiaru i koloru; bez nadruku / jednostronny / dwustronny identyczny / dwustronny różny; 1–3 kolory na stronę |
| Opakowania prezentowe (referencja GiftBox) | 4 (S–XL) | GC1 230 g; CMYK 4/0; mat/błysk; 21 kolorów sznurka i niezależnie 21 kolorów tasiemki |
| Bawełna | 39 | Warianty gramatury, koloru, rozmiaru i długości uchwytu jako osobne modele; zwykle bez nadruku / sitodruk 1–6 kolorów / DTF w trzech przedziałach powierzchni |
| Workoplecaki | 7 | Bawełna lub materiał z recyklingu; bez nadruku / sitodruk 1–6 kolorów / DTF |
| Juta | 6 | JUMBO, BOUTIQUE, CLASSIC, MIDI, COMPACT, MINI; bez nadruku lub jednostronny sitodruk **1 kolor** |

**Wyjątek bawełny:** dwie torby na butelkę 407 g mają w formularzu wyłącznie bez nadruku lub DTF. Nie otrzymują sitodruku przez dziedziczenie z rodziny.

**Formaty:** laminowane S/M/L/XL/XXL: odpowiednio **22/33/36/16/15** pozycji. Kraft premium: **12/20/22/12/7**. GiftBox: S 18×9×18 lub 9×9×32; M 22×10×22; L 30×11×30; XL 35×12×35. Wszystkie listy są zapisane per model, bez tworzenia dowolnych kombinacji.

**DTF:** mały 100–199 cm², średni 200–499 cm², duży 500–800 cm². To pole powierzchni, nie wymiary A4/A3. Selektor zastępuje liczbę kolorów sitodruku.

**Kolory sznurka laminowanego:** biały, beżowy, cytrynowy, żółty, groszkowy, zielony jasny, zielony, zielony ciemny, pomarańczowy, szary, szary ciemny, fioletowy, niebieski jasny, niebieski chabrowy, granatowy, srebrny, czerwony, różowy, purpurowy, bordo, złoty, brązowy, brązowy ciemny, czarny.

**Kraft premium:** czarny, brązowy, zielony, bordowy, biały.

## Standard a wycena indywidualna

Na laminowanych kartach opis wymienia dodatkowo soft touch, scuff free, lakier UV wybiórczy, hot stamping, inne papiery 170–250 g, Pantone i inne uchwyty (bawełniany sznurek, tasiemka satynowa/rypsowa, uchwyt wycinany). Nie są to zwykłe selektory z automatyczną ceną w zbadanym formularzu.

We froncie Printbag24 efekty specjalne i inny uchwyt są **osobnymi życzeniami do wyceny** (`requests`), nigdy podmianą standardowych opcji. Podgląd pokazuje standardową konstrukcję; nie symuluje hot stampingu ani niestandardowych uchwytów. Papier specjalny i Pantone można doprecyzować w uwagach do zapytania. Trzeba ustalić rzeczywiste możliwości klienta, zanim staną się automatycznie wycenianymi opcjami.

Wszystkie nowe konfiguracje mają `pricing: "quote"`. Nie podpinamy do nich starej przykładowej ceny 690 zł ani cen Bagpack. RGB jest wskazówką ekranową dla zadrukowanych modeli laminowanych/prezentowych, a nie obietnicą dowolnego koloru tkaniny. Gotowe torby kraft/bawełna/juta/workoplecak mają kolor wybranego wariantu.

## Różnice i niejednoznaczności referencji

- `4/0` przy offsecie opisuje zadruk jednej strony arkusza przed złożeniem. **Nie oznacza zakazu nadruku na przedniej i tylnej ściance torby.** Nasz edytor rozróżnia ścianki; technika jest oddzielnym parametrem.
- W referencyjnych inputach nakładu występuje `min=20`, ale opisy niektórych toreb mówią o nadruku od 100 szt. Są też ceny „od” i ilości kartonowe. Nie traktujemy atrybutu HTML ani liczby sztuk w kartonie jako wiarygodnego MOQ. Nasz formularz przyjmuje żądany nakład 1–100000 do wyceny; minimum potwierdzi backend/handlowiec.
- Zastane `max=4300` na jednej karcie nie jest naszym stanem magazynowym.
- Torby na butelkę pokazują te same przedziały DTF co duże torby. Backend musi sprawdzić fizyczne pole druku — nie wolno automatycznie zatwierdzić 800 cm² na panelu 8×27 cm.
- Specyfikacja workoplecaków podaje 37×40×10. W podglądzie interpretujemy to jako szerokość × wysokość × głębokość; wymaga potwierdzenia wykrojnikiem dostawcy. Papier/juta: szerokość × głębokość × wysokość. Bawełna 38×42+10+10: szerokość, wysokość i dwa kliny.
- Dla kraft brąz 18×8×22 nie było tabeli technicznej; nie dopisujemy brakującej gramatury. Format bierze się z nazwy karty.
- Część opisów wspomina kontakt w sprawie nadruku dwustronnego mimo obecności opcji w formularzu. Dlatego dostępność technologii jest sprawdzana w wycenie, nie obiecywana samym selektorem.

## Co działa w tym froncie

1. `/catalog/` — 109 modeli, 7 rodzin, wyszukiwanie, link do modelu.
2. `/configuration/?sku=<productId>` — parametry zależne od modelu, format, kolor sznurka/tasiemki, wykończenie, technika, liczba kolorów lub pole DTF, nakład. Model dobiera konkretną kombinację koloru/gramatury/uchwytu.
3. Widok **2D dokładnie od frontu**, logo PNG/JPG/SVG, położenie i skala, niezależne strony lub synchronizacja „taki sam nadruk” dla kraftu. „Bez nadruku” wyłącza grafikę w zapisywanym projekcie.
4. Papier laminowany może przejść do istniejącego `/studio-3d/`. Format przebudowuje geometrię, sznurek ma wybrany kolor, folia zmienia chropowatość. Z tego studia można wrócić do parametrów, zachowując nadruk. Inne konstrukcje mają schemat 2D — nie udają modelu 3D papieru.
5. Przegląd projektu → koszyk wycen → formularz danych → zapis/pobranie paczki JSON. Parametry, dodatkowe życzenia, nakład, podglądy obu stron i pliki idą razem. Edycja z koszyka je przywraca.
6. Projekty wersji 1 ze starego studia nadal się otwierają. Nie migrujemy ich automatycznie do nowego SKU i nie nadpisujemy formatu.

Podgląd jest kompozycją, nie plikiem produkcyjnym. Brak finalnych wykrojników, marginesów druku i modeli wszystkich konstrukcji. Rozdzielczość, geometria druku, efekt uszlachetnień i kolory muszą przejść preflight przed produkcją.

## Dane i kontrakt Joomla

Źródło danych UI: `configuration/catalog-data.js` (generowane przez `python3 tools/build-bag-catalog.py`). Zachowujemy stabilne własne identyfikatory pól. Identyfikatory `wapf[field_…]` służą wyłącznie jako materiał audytu — nie jako API naszego systemu.

Projekt zapisany w IndexedDB `printbag24-studio`, store `projects`, kopia w `cart`:

```json
{
  "version": 2,
  "id": "UUID projektu",
  "product": "torby-papierowe-laminowane-m",
  "configuration": {
    "schemaVersion": 1,
    "catalogVersion": "2026-10-31",
    "productId": "torby-papierowe-laminowane-m",
    "family": "laminated",
    "productName": "Papier laminowany M",
    "dimensions": {"width":24,"depth":9,"height":26,"label":"24x9x26 cm"},
    "specs": {"Gramatura":"170g"},
    "options": {
      "size":{"value":"24x9x26","label":"Format (cm)","display":"24x9x26"},
      "cord":{"value":"czerwony","label":"Kolor sznurka","display":"czerwony"},
      "finish":{"value":"folia-mat","label":"Uszlachetnienie","display":"folia mat"}
    },
    "bodyColor":"#164f3c",
    "requests":[{"type":"finish","value":"Hot stamping"}],
    "pricing":"quote"
  },
  "quantity":100,
  "color":{"name":"Własny kolor","body":"#164f3c","inside":"#164f3c","ink":"#174f3d"},
  "preset":null,
  "faces":{
    "front":{"kind":"image","name":"logo.svg","size":48,"x":0,"y":0,"blob":"Blob w IndexedDB"},
    "back":{"kind":"none","name":"","size":48,"x":0,"y":0,"blob":null}
  },
  "thumbnails":{"front":"data:image/png;base64,…","back":"data:image/png;base64,…"},
  "updatedAt":0
}
```

Przykład jest skrócony: runtime zapisuje wszystkie aktywne pola. Eksport paczki ma `schemaVersion: 2`, `status: "prepared-locally"`, identyfikator podsumowania, `kind`, `contact`, `projects[]`. Bloby plików zamieniają się na `faces.<side>.file` w postaci data URL; chwilowe blob URL nie są eksportowane. W wersji serwerowej należy zastąpić to identyfikatorami bezpiecznych uploadów.

| Pole frontu | Przeznaczenie w Joomla / panelu |
|---|---|
| `productId`, `family`, `catalogVersion` | Powiązanie z rzeczywistym SKU i wersją cennika; tabela mapowania do ID panelu |
| `size` | Format z listy właściwej dla danego SKU, jednostka cm |
| `paper` | Rodzaj i gramatura papieru |
| `printing` | Offset CMYK / 1 kolor arkusza, niezależnie od ścianek projektu |
| `finish` | Laminacja mat/błysk |
| `cord`, `ribbon` | Oddzielne kolory komponentów |
| `printMode` | Bez nadruku / jedna strona / obie identyczne / obie różne / DTF |
| `inkFront`, `inkBack` | Liczba kolorów sitodruku; tył tylko przy różnych nadrukach |
| `dtfSize` | Przedział powierzchni DTF; nieaktywny przy sitodruku |
| `requests[]` | Życzenia wymagające akceptacji handlowej/technologicznej |
| `bodyColor` | RGB podglądu; do osobnego ustalenia CMYK/Pantone |
| `quantity` | Żądany nakład, walidacja MOQ i progu cenowego na serwerze |
| `faces`, `thumbnails` | Pliki źródłowe, kompozycja oraz podglądy do akceptacji |

### Punkty podłączenia

- `configuration/config.js`: reguły widoczności i serializacja; zastąpić/uzupełnić danymi katalogu z Joomla.
- `configuration/editor.js` oraz `studio-3d/order-bridge.js`: zapis projektu i przejście do przeglądu.
- `order/store.js`: obecnie IndexedDB. Tu wstawić adapter katalogu/projektów/koszyka/wyceny z panelem.
- `order/order.js`: review, cart, dane, przygotowanie paczki. Docelowo dodać odpowiedź serwera z ID zamówienia i płatnością zamiast lokalnego potwierdzenia.

Proponowany kontrakt logiczny (nazwy endpointów do uzgodnienia z gotowym komponentem Joomla, **nie istnieją teraz**): pobierz katalog → utwórz/zapisz projekt → prześlij pliki → poproś o wycenę → dodaj wyceniony projekt do koszyka → zatwierdź zamówienie. Serwer musi sprawdzać SKU, zależności opcji, MOQ, rzeczywiste pole druku, pliki, VAT, dostawę i cenę; nie ufać nazwom ani cenom przesłanym z klienta. Potrzebna kontrola wersji projektu i cennika, żeby zmiana konfiguracji unieważniała wcześniejszą wycenę.

### Co klient musi potwierdzić przed sprzedażą

Rzeczywista oferta i dostawcy/SKU, dopuszczalne formaty i kolory, MOQ i progi, technologie per materiał, pole druku i wykrojniki, normy plików, dopłaty/uszlachetnienia, terminy i dostawa. Front jest gotowy do przełączania parametrów, ale nie jest jeszcze połączony z operacyjnym panelem Joomla, magazynem, logowaniem ani płatnościami.

## Weryfikacja

Automatycznie: `node --test tests/configuration.test.mjs` porównuje listy wszystkich opcji z audytem, sprawdza zależności, wyjątki, serializację i kompatybilność projektu v1. Ręcznie w przeglądarce: parametry → 3D → review → koszyk → edycja; GiftBox z osobną tasiemką i logo; filtry, widok mobilny i eksport paczki.
