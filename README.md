# Hubert Paszkiewicz – konsultant Raypath

Strona-wizytówka niezależnego konsultanta Raypath International. Statyczna strona (HTML + CSS + JS, bez frameworków), hostowana za darmo na **Cloudflare Pages** z kodem na **GitHubie**.

Sprzedaż odbywa się w oficjalnym sklepie konsultanta Raypath – strona kieruje tam wszystkie przyciski „Sklep”.

## Struktura

```
index.html          strona główna (cała treść, style i skrypty)
404.html            strona „nie znaleziono”
_headers            nagłówki bezpieczeństwa i cache dla Cloudflare Pages
robots.txt          informacja dla wyszukiwarek
sitemap.xml         mapa strony dla Google
favicon.svg         ikona w karcie przeglądarki
img/                portret, obrazek do udostępnień (og-image.jpg), ikona iPhone
fonts/              fonty Cormorant Garamond i Jost (lokalnie – bez Google Fonts)
```

Strona nie wysyła żadnych zapytań do zewnętrznych serwerów, nie używa cookies ani narzędzi śledzących. Formularz kontaktowy otwiera program pocztowy odwiedzającego (mailto) – nic nie jest zapisywane.

## Wdrożenie – krok po kroku

### 1. GitHub
1. Zaloguj się na github.com → **New repository**.
2. Nazwa: `hubert-raypath`, widoczność **Public** lub **Private** (obie działają z Cloudflare). Nie zaznaczaj „Add a README”.
3. Kliknij **uploading an existing file**, przeciągnij **zawartość** folderu (pliki i foldery `img`, `fonts` – nie sam folder nadrzędny) i zatwierdź **Commit changes**.

   Albo z terminala, w tym folderze:
   ```bash
   git init -b main
   git add -A
   git commit -m "Pierwsza wersja strony"
   git remote add origin https://github.com/TWOJ-LOGIN/hubert-raypath.git
   git push -u origin main
   ```

### 2. Cloudflare Pages
1. dash.cloudflare.com → **Workers & Pages** → **Create** → zakładka **Pages** → **Connect to Git**.
2. Wybierz repozytorium `hubert-raypath` → **Begin setup**.
3. Ustawienia budowania:
   - **Project name:** `hubert-raypath` → adres będzie `https://hubert-raypath.pages.dev`
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(puste)*
   - **Build output directory:** `/`
4. **Save and Deploy**. Po ok. minucie strona działa.

Każda zmiana wypchnięta na GitHub (`main`) publikuje się automatycznie.

### 3. Jeśli adres jest inny niż `hubert-raypath.pages.dev`
Gdy nazwa projektu była zajęta albo podpinasz własną domenę, zamień adres `https://hubert-raypath.pages.dev` na właściwy w plikach:
- `index.html` – `canonical`, `og:url`, `og:image`, dane strukturalne (JSON-LD),
- `sitemap.xml`,
- `robots.txt`.

### 4. Własna domena (później)
Cloudflare Pages → projekt → **Custom domains** → **Set up a custom domain**. Domenę najprościej kupić od razu w Cloudflare (Domain Registration) albo przenieść jej DNS do Cloudflare. Potem zaktualizuj adresy z punktu 3.

### 5. Google
Po publikacji dodaj stronę w **Google Search Console** (weryfikacja przez rekord DNS lub plik) i zgłoś `sitemap.xml`. Warto też założyć **Profil Firmy w Google** z linkiem do strony.

## Najczęstsze zmiany

| Co zmienić | Gdzie |
|---|---|
| Adres sklepu Raypath | `index.html` → na dole `const SHOP_URL = "..."` |
| E-mail formularza | `index.html` → `const EMAIL = "..."` oraz linki `mailto:` |
| Telefon | `index.html` → szukaj `510085688` i `510 085 688` (też w `404.html`) |
| Zdjęcie | podmień `img/hubert-paszkiewicz.webp` (kwadrat, min. 600×600 px, ta sama nazwa) |
| Rekomendacje w „Dobór w 30 sekund” | `index.html` → obiekt `REC` w skrypcie |

## Do potwierdzenia przez Huberta przed promocją
- Program wymiany zużytych czyścików za pół ceny – czy działa w Polsce przez jego sklep.
- Bezpłatne doradztwo – strona to obiecuje.
- Opisy technologii pochodzą z materiałów producenta i są tak oznaczone.

---
Projekt strony: [Strony AI Wrocław](https://stronyaiwroclaw.pl)
