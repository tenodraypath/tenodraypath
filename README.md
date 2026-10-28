# Hubert Paszkiewicz – konsultant Raypath

Strona-wizytówka z panelem administracyjnym. Hosting: **Cloudflare Pages** (darmowy plan) + **GitHub**. Treści zapisane w panelu trafiają do bazy **Cloudflare KV** i od razu widzą je wszyscy odwiedzający.

Sprzedaż odbywa się w oficjalnym sklepie konsultanta Raypath – przyciski „Sklep” prowadzą tam.

## Co jest w repozytorium

```
public/            strona (to Cloudflare udostępnia odwiedzającym)
  index.html       strona główna (wstępnie wyrenderowana treść – dla Google)
  admin/           panel administracyjny  →  https://twoja-strona/admin/
  js/ css/ fonts/ img/
  _headers         nagłówki bezpieczeństwa i cache
  _routes.json     które adresy obsługuje serwer (/ i /api/*)
functions/         serwer Cloudflare (logowanie, zapis treści, zdjęcia, historia)
```

Kod serwera z folderu `functions/` **nie jest dostępny** pod żadnym adresem strony.

## Wdrożenie krok po kroku

### 1. GitHub
1. github.com → **New repository** → nazwa np. `hubert-raypath`. Zalecana widoczność: **Private**.
2. Wgraj **zawartość** paczki (foldery `public`, `functions` i pliki z głównego katalogu) – przez **uploading an existing file** albo z terminala:
   ```bash
   git init -b main
   git add -A
   git commit -m "Strona Huberta Paszkiewicza"
   git remote add origin https://github.com/TWOJ-LOGIN/hubert-raypath.git
   git push -u origin main
   ```

### 2. Baza KV (raz)
dash.cloudflare.com → **Storage & Databases → KV** (albo **Workers & Pages → KV**) → **Create a namespace** → nazwa np. `hubert-cms` → **Add**.

### 3. Projekt Cloudflare Pages
1. **Workers & Pages → Create → Pages → Connect to Git** → wybierz repozytorium.
2. Ustawienia budowania:
   - **Project name:** `hubert-raypath` → adres `https://hubert-raypath.pages.dev`
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(puste)*
   - **Build output directory:** `public`
3. **Save and Deploy**.
4. Podłącz bazę: projekt → **Settings → Bindings** (w starszym panelu: *Settings → Functions → KV namespace bindings*) → **Add → KV namespace**:
   - **Variable name:** `CMS` (dokładnie tak, wielkimi literami)
   - **KV namespace:** `hubert-cms`
5. **Deployments → ostatnie wdrożenie → ⋯ → Retry deployment** (powiązanie działa od następnego wdrożenia).

### 4. Pierwsze logowanie
- Wejdź na `https://hubert-raypath.pages.dev/admin/`
- Login: `admin`, hasło: `hubert2026`
- **Od razu zmień hasło** w zakładce **Hasło** (panel o tym przypomina). Nowe hasło jest zapisywane wyłącznie jako skrót PBKDF2 – nikt, także autor strony, nie odczyta go z bazy.

Opcjonalnie: zamiast `hubert2026` możesz ustawić własne hasło startowe w **Settings → Variables and Secrets** jako sekret `ADMIN_PASSWORD` (działa do pierwszej zmiany hasła w panelu).

### 5. Gdy adres jest inny niż `hubert-raypath.pages.dev`
Zmień adres w `build.js` (stała `SITE_URL`) w paczce źródłowej i zbuduj ponownie (`node build.js`) albo podmień `https://hubert-raypath.pages.dev/` ręcznie w `public/index.html`, `public/sitemap.xml` i `public/robots.txt`.

### 6. Własna domena (później)
Projekt → **Custom domains → Set up a custom domain**. Potem punkt 5.

## Jak działa panel

| Funkcja | Gdzie |
|---|---|
| Edycja treści każdej sekcji | Sekcje → kliknij sekcję |
| Podgląd na żywo (sekcja / cała strona, komputer / tablet / telefon) | prawa kolumna; na mniejszych ekranach przycisk **Podgląd** |
| Kolejność sekcji | przeciągnij za uchwyt ⋮⋮ albo strzałki ↑ ↓ (klawiatura: Alt + strzałki) |
| Ukrycie bez usuwania | ikona oka |
| Nowa sekcja (tekst, tekst ze zdjęciem, oś czasu, opinie, FAQ, baner…) | **+ Dodaj sekcję** |
| Duplikowanie, usuwanie, przywrócenie treści początkowej | przyciski nad edytorem sekcji |
| Menu: czy sekcja jest w menu i pod jaką nazwą | dół edytora sekcji („Wygląd i menu”) |
| Zdjęcia | pole zdjęcia → **Wgraj zdjęcie** (panel sam zmniejsza je do WebP) |
| Telefon, e-mail, adres sklepu, opis w Google, stopka, animacja otwarcia | **Ustawienia** |
| Efekt przejścia do sekcji (koło, kurtyna, płynny lot, zwykłe przewijanie) i ikona logowania w rogu strony | **Ustawienia** |
| Zmiana hasła | **Hasło** (wylogowuje pozostałe urządzenia) |
| Kopia w pliku, historia zapisów z 60 dni, powrót do wersji początkowej | **Kopie** |

**Zapis jest automatyczny** – półtorej sekundy po ostatniej zmianie (status „Zapisano · godzina” w górnym pasku). Przycisk „Zapisz teraz” i Ctrl/Cmd + S zapisują od razu. Historia zapisów tworzy kopię najwyżej co 10 minut.

Zabezpieczenia: blokada po 8 błędnych próbach logowania (15 minut), sesja wygasa po 8 godzinach, wykrywanie zapisu z dwóch urządzeń naraz (autozapis wtedy się wstrzymuje i pyta), szkic zmian w przeglądarce na wypadek braku internetu.

Bez podłączonej bazy panel działa w **trybie lokalnym** – wyraźnie to pokazuje, a zmiany zapisuje tylko w tej przeglądarce.

## Formularz kontaktowy
Domyślnie otwiera program pocztowy klienta z gotową wiadomością. W **Ustawieniach** można przełączyć na **FormSubmit.co** – wiadomość trafia wtedy prosto na skrzynkę; przy pierwszym wysłaniu FormSubmit przyśle e-mail z linkiem aktywacyjnym.

Formularz ma walidację pól, pułapkę na boty i minimalny czas wypełnienia.

## Limity darmowego planu Cloudflare
KV: 100 000 odczytów i 1 000 zapisów dziennie – z ogromnym zapasem dla strony-wizytówki (jedno wejście na stronę = jeden odczyt, jeden zapis w panelu = 2–3 zapisy).

## Do potwierdzenia przez Huberta
- Program wymiany zużytych czyścików za pół ceny – czy działa przez jego sklep.
- Bezpłatne doradztwo – strona to obiecuje.
- Oś czasu historii Raypath powstała z publicznych źródeł (oficjalna strona marki, KRS, artykuły branżowe); część etapów nie ma dokładnych dat. Można je doprecyzować w panelu.
- Sekcja **Opinie klientów** jest ukryta – włącz ją, gdy pojawią się prawdziwe opinie (za zgodą klientów).

## Praca na źródłach (dla programisty)
Paczka źródłowa: `src/` + `build.js`. Polecenie `node build.js` tworzy `dist/` (to, co idzie na GitHub).
Test lokalny z bazą: `npx wrangler pages dev public --kv CMS` uruchomione w `dist/`.

---
Projekt strony: [Strony AI Wrocław](https://stronyaiwroclaw.pl)
