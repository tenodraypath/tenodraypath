// Opis typów sekcji dla panelu: etykiety, pola edycji i szablony nowych sekcji.

export const ICONS = {
  drop: "Kropla", fiber: "Włókno", shield: "Tarcza", recycle: "Recykling", home: "Dom", gift: "Prezent",
  building: "Biznes", leaf: "Liść", star: "Gwiazda", heart: "Serce", phone: "Telefon", spark: "Blask",
  check: "Ptaszek", hand: "Dłoń", sun: "Słońce", clock: "Zegar"
};

const BTN = { k: "buttons", label: "Przyciski", type: "list", itemLabel: "Przycisk", max: 3,
  fields: [
    { k: "label", label: "Napis", type: "text" },
    { k: "link", label: "Prowadzi do", type: "link" },
    { k: "style", label: "Styl", type: "select", options: { primary: "Wyróżniony (złoty / bordowy)", outline: "Obrys" } }
  ],
  blank: { label: "Nowy przycisk", link: "{sklep}", style: "primary" } };

const KICKER = { k: "kicker", label: "Nadtytuł (małe litery nad tytułem)", type: "text" };
const TITLE = { k: "title", label: "Tytuł", type: "text" };
const INTRO = { k: "intro", label: "Wstęp", type: "textarea" };
const NOTE = { k: "note", label: "Przypis pod sekcją", type: "text" };

export const THEMES = { light: "Jasne tło", soft: "Jasne, przygaszone tło", dark: "Bordowe tło" };

export const TYPES = {
  hero: {
    label: "Ekran powitalny", desc: "Pierwszy ekran: hasło, przyciski i okrągłe zdjęcie.", single: true,
    fields: [KICKER, TITLE,
      { k: "titleAccent", label: "Druga linia tytułu (kursywa)", type: "text" },
      { k: "lead", label: "Opis", type: "textarea" }, BTN,
      { k: "micro", label: "Mały tekst pod przyciskami (numer telefonu dodaje się sam)", type: "text" },
      { k: "photo", label: "Zdjęcie (kwadratowe, twarz na środku)", type: "image" },
      { k: "photoAlt", label: "Opis zdjęcia dla niewidomych", type: "text" },
      { k: "ringText", label: "Napis na obracającym się pierścieniu", type: "text" },
      { k: "sealTop", label: "Pieczęć – górna linia", type: "text" },
      { k: "sealBottom", label: "Pieczęć – dolna linia (kursywa)", type: "text" },
      { k: "sealLink", label: "Pieczęć prowadzi do", type: "link" }],
    template: () => ({ kicker: "Nadtytuł", title: "Tytuł strony.", titleAccent: "Druga linia tytułu.", lead: "Krótki opis.", buttons: [], micro: "", photo: "/img/hubert-paszkiewicz.webp", photoAlt: "", ringText: "Konsultant · Raypath International ·", sealTop: "", sealBottom: "", sealLink: "#kontakt" })
  },
  about: {
    label: "O mnie", desc: "Cytat, opis, liczby i zasady pracy.",
    fields: [KICKER, TITLE,
      { k: "quote", label: "Cytat", type: "textarea" },
      { k: "text", label: "Opis (pusta linia = nowy akapit, **pogrubienie**)", type: "rich" },
      { k: "signature", label: "Podpis", type: "text" },
      { k: "facts", label: "Wyróżnione liczby", type: "list", itemLabel: "Liczba", max: 4,
        fields: [{ k: "value", label: "Wartość", type: "text" }, { k: "label", label: "Opis", type: "text" }], blank: { value: "1", label: "opis" } },
      { k: "principles", label: "Zasady pracy", type: "list", itemLabel: "Zasada", max: 6,
        fields: [{ k: "title", label: "Nazwa", type: "text" }, { k: "text", label: "Opis", type: "textarea" }], blank: { title: "Nowa zasada", text: "" } }],
    template: () => ({ kicker: "O mnie", title: "Kim jestem", quote: "", text: "Opis.", signature: "", facts: [], principles: [] })
  },
  pillars: {
    label: "Marka i filary", desc: "Duża liczba, opis i kafle z ikonami.",
    fields: [
      { k: "bigNumber", label: "Duża liczba lub rok", type: "text" },
      { k: "bigLabel", label: "Podpis pod liczbą", type: "text" }, KICKER, TITLE,
      { k: "text", label: "Opis (pusta linia = nowy akapit)", type: "rich" },
      { k: "items", label: "Filary", type: "list", itemLabel: "Filar", max: 6,
        fields: [{ k: "icon", label: "Ikona", type: "select", options: ICONS }, { k: "title", label: "Nazwa", type: "text" }, { k: "text", label: "Opis", type: "textarea" }],
        blank: { icon: "leaf", title: "Nowy filar", text: "" } }],
    template: () => ({ bigNumber: "30+", bigLabel: "lat", kicker: "Nadtytuł", title: "Tytuł", text: "Opis.", items: [] })
  },
  timeline: {
    label: "Oś czasu", desc: "Pionowa oś z datami i wydarzeniami.",
    fields: [KICKER, TITLE, INTRO,
      { k: "items", label: "Wydarzenia", type: "list", itemLabel: "Wydarzenie", max: 30,
        fields: [{ k: "date", label: "Data lub etap", type: "text" }, { k: "title", label: "Tytuł", type: "text" }, { k: "text", label: "Opis", type: "textarea" }],
        blank: { date: "Rok", title: "Wydarzenie", text: "" } }, NOTE],
    template: () => ({ kicker: "Historia", title: "Oś czasu", intro: "", items: [{ date: "Rok", title: "Wydarzenie", text: "Opis." }], note: "" })
  },
  tech: {
    label: "Jak to działa", desc: "Numerowane punkty opisujące technologię.",
    fields: [KICKER, TITLE, INTRO,
      { k: "items", label: "Punkty", type: "list", itemLabel: "Punkt", max: 8,
        fields: [{ k: "title", label: "Tytuł", type: "text" }, { k: "text", label: "Opis", type: "textarea" }], blank: { title: "Nowy punkt", text: "" } }, NOTE],
    template: () => ({ kicker: "Jak to działa", title: "Tytuł", intro: "", items: [{ title: "Punkt", text: "Opis." }], note: "" })
  },
  compare: {
    label: "Porównanie", desc: "Dwie kolumny: „przed” i „po”.",
    fields: [KICKER, TITLE,
      { k: "leftTitle", label: "Lewa kolumna – tytuł", type: "text" },
      { k: "leftItems", label: "Lewa kolumna – punkty (jeden w linii)", type: "lines" },
      { k: "rightTitle", label: "Prawa kolumna – tytuł", type: "text" },
      { k: "rightItems", label: "Prawa kolumna – punkty (jeden w linii)", type: "lines" }],
    template: () => ({ kicker: "Porównanie", title: "Tytuł", leftTitle: "Przed", leftItems: "Punkt", rightTitle: "Po", rightItems: "Punkt" })
  },
  calculator: {
    label: "Kalkulator wydatków", desc: "Suwak liczący wydatki na środki czystości.", single: true,
    fields: [KICKER, TITLE, INTRO,
      { k: "min", label: "Suwak od (zł)", type: "number" }, { k: "max", label: "Suwak do (zł)", type: "number" },
      { k: "step", label: "Krok (zł)", type: "number" }, { k: "value", label: "Wartość startowa (zł)", type: "number" },
      { k: "bottlePrice", label: "Średnia cena butelki (zł)", type: "number" },
      { k: "ctaLabel", label: "Przycisk – napis", type: "text" }, { k: "ctaLink", label: "Przycisk prowadzi do", type: "link" }, NOTE],
    template: () => ({ kicker: "Policz sam", title: "Ile wydajesz na chemię?", intro: "", min: 20, max: 250, step: 5, value: 60, bottlePrice: 12, ctaLabel: "Zobacz w sklepie", ctaLink: "{sklep}", note: "" })
  },
  quiz: {
    label: "Dobór produktów", desc: "Kafle do kliknięcia z rekomendacją.", single: true,
    fields: [KICKER, TITLE,
      { k: "options", label: "Opcje", type: "list", itemLabel: "Opcja", max: 6,
        fields: [{ k: "icon", label: "Ikona", type: "select", options: ICONS }, { k: "label", label: "Napis na kaflu", type: "text" },
          { k: "resultTitle", label: "Rekomendacja – tytuł", type: "text" }, { k: "resultText", label: "Rekomendacja – opis", type: "textarea" },
          { k: "btnLabel", label: "Przycisk – napis", type: "text" }, { k: "btnLink", label: "Przycisk prowadzi do", type: "link" }],
        blank: { icon: "star", label: "Nowa opcja", resultTitle: "", resultText: "", btnLabel: "Zobacz w sklepie", btnLink: "{sklep}" } }],
    template: () => ({ kicker: "Dobór", title: "Od czego chcesz zacząć?", options: [] })
  },
  products: {
    label: "Oferta / kategorie", desc: "Siatka kategorii z linkami do sklepu.",
    fields: [KICKER, TITLE, INTRO,
      { k: "items", label: "Kategorie", type: "list", itemLabel: "Kategoria", max: 12,
        fields: [{ k: "title", label: "Nazwa", type: "text" }, { k: "text", label: "Opis", type: "textarea" },
          { k: "badge", label: "Wyróżnienie (np. „Nowość”) – opcjonalnie", type: "text" }, { k: "link", label: "Prowadzi do", type: "link" }],
        blank: { title: "Nowa kategoria", text: "", badge: "", link: "{sklep}" } }],
    template: () => ({ kicker: "Oferta", title: "Produkty", intro: "", items: [] })
  },
  steps: {
    label: "Kroki", desc: "Proces w kilku krokach z przyciskami.",
    fields: [KICKER, TITLE, INTRO,
      { k: "items", label: "Kroki", type: "list", itemLabel: "Krok", max: 6,
        fields: [{ k: "title", label: "Nazwa", type: "text" }, { k: "text", label: "Opis", type: "textarea" }], blank: { title: "Krok", text: "" } }, BTN],
    template: () => ({ kicker: "Jak to wygląda", title: "W trzech krokach", intro: "", items: [], buttons: [] })
  },
  testimonials: {
    label: "Opinie klientów", desc: "Prawdziwe opinie – publikuj tylko za zgodą klientów.",
    fields: [KICKER, TITLE,
      { k: "items", label: "Opinie", type: "list", itemLabel: "Opinia", max: 12,
        fields: [{ k: "text", label: "Treść opinii", type: "textarea" }, { k: "author", label: "Imię (np. „Anna”)", type: "text" }, { k: "place", label: "Miejscowość – opcjonalnie", type: "text" }],
        blank: { text: "", author: "", place: "" } }, NOTE],
    template: () => ({ kicker: "Opinie", title: "Co mówią klienci", items: [], note: "Opinie publikowane za zgodą klientów." })
  },
  faq: {
    label: "Pytania i odpowiedzi", desc: "Rozwijana lista pytań.",
    fields: [KICKER, TITLE,
      { k: "items", label: "Pytania", type: "list", itemLabel: "Pytanie", max: 20,
        fields: [{ k: "q", label: "Pytanie", type: "text" }, { k: "a", label: "Odpowiedź", type: "textarea" }], blank: { q: "Nowe pytanie?", a: "" } }],
    template: () => ({ kicker: "Pytania", title: "Najczęstsze pytania", items: [] })
  },
  cta: {
    label: "Baner z przyciskami", desc: "Wyróżniony pas z hasłem i przyciskami.",
    fields: [KICKER, TITLE, { k: "text", label: "Opis", type: "textarea" }, BTN],
    template: () => ({ kicker: "Nadtytuł", title: "Hasło banera", text: "", buttons: [{ label: "Zadzwoń", link: "{telefon}", style: "primary" }] })
  },
  text: {
    label: "Tekst", desc: "Dowolna sekcja z tytułem i tekstem.",
    fields: [KICKER, TITLE, { k: "titleAccent", label: "Druga linia tytułu (kursywa)", type: "text" },
      { k: "text", label: "Treść (pusta linia = nowy akapit, **pogrubienie**)", type: "rich" },
      { k: "align", label: "Wyrównanie", type: "select", options: { center: "Do środka", left: "Do lewej" } }, BTN],
    template: () => ({ kicker: "", title: "Nowa sekcja", titleAccent: "", text: "Treść sekcji.", align: "center", buttons: [] })
  },
  imagetext: {
    label: "Tekst ze zdjęciem", desc: "Zdjęcie obok tekstu.",
    fields: [KICKER, TITLE, { k: "text", label: "Treść (pusta linia = nowy akapit)", type: "rich" },
      { k: "image", label: "Zdjęcie", type: "image" }, { k: "imageAlt", label: "Opis zdjęcia dla niewidomych", type: "text" },
      { k: "imageSide", label: "Zdjęcie po stronie", type: "select", options: { left: "Lewej", right: "Prawej" } },
      { k: "imageShape", label: "Kształt zdjęcia", type: "select", options: { circle: "Koło", rounded: "Prostokąt" } }, BTN],
    template: () => ({ kicker: "", title: "Tytuł", text: "Treść.", image: "", imageAlt: "", imageSide: "left", imageShape: "circle", buttons: [] })
  },
  contact: {
    label: "Kontakt", desc: "Telefon, e-mail i formularz.", single: true,
    fields: [KICKER, TITLE, { k: "text", label: "Opis nad danymi (opcjonalnie)", type: "textarea" },
      { k: "showPhone", label: "Pokaż numer telefonu", type: "bool" }, { k: "showEmail", label: "Pokaż e-mail", type: "bool" },
      { k: "showForm", label: "Pokaż formularz", type: "bool" },
      { k: "topics", label: "Tematy w formularzu (jeden w linii)", type: "lines" },
      { k: "consent", label: "Tekst zgody", type: "text" }],
    template: () => ({ kicker: "Kontakt", title: "Zapraszam do rozmowy", text: "", showPhone: true, showEmail: true, showForm: true, topics: "Pytanie o produkty\nInne", consent: "Wyrażam zgodę na kontakt w sprawie mojego zapytania." })
  }
};

export const COMMON_FIELDS = [
  { k: "theme", label: "Tło sekcji", type: "select", options: THEMES },
  { k: "inMenu", label: "Pokaż w menu", type: "bool" },
  { k: "menuLabel", label: "Nazwa w menu", type: "text" },
  { k: "id", label: "Adres sekcji (po #, np. „kontakt”)", type: "slug" }
];

export const SETTINGS_FIELDS = [
  { k: "name", label: "Imię i nazwisko", type: "text" },
  { k: "monogram", label: "Monogram w logo", type: "text" },
  { k: "role", label: "Podpis pod logo", type: "text" },
  { k: "phone", label: "Telefon", type: "text" },
  { k: "email", label: "E-mail (tu trafiają wiadomości z formularza)", type: "text" },
  { k: "shopUrl", label: "Adres sklepu Raypath – link {sklep}", type: "text" },
  { k: "joinUrl", label: "Adres rejestracji „Dołącz” – link {dolacz}", type: "text" },
  { k: "formMode", label: "Wysyłka formularza", type: "select", options: { mailto: "Otwórz program pocztowy klienta (mailto)", formsubmit: "Wyślij przez FormSubmit.co (bez programu pocztowego)" } },
  { k: "intro", label: "Animacja przy otwarciu strony", type: "bool" },
  { k: "navEffect", label: "Przejście do sekcji po kliknięciu w menu", type: "select", options: { iris: "Koło – rozchodzi się od miejsca kliknięcia (polecane)", curtain: "Kurtyna z monogramem", glide: "Płynny lot ze złotą linią postępu", none: "Zwykłe przewijanie" } },
  { k: "adminLink", label: "Ikona logowania do panelu w lewym dolnym rogu strony", type: "bool" },
  { k: "seoTitle", label: "Tytuł w Google (do 60 znaków)", type: "text" },
  { k: "seoDescription", label: "Opis w Google (do 160 znaków)", type: "textarea" },
  { k: "footerLegal", label: "Stopka – informacja prawna", type: "textarea" },
  { k: "footerPrivacy", label: "Stopka – prywatność", type: "textarea" }
];
