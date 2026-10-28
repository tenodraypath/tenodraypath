// Domyślne treści strony. Stan zapisany w panelu nakłada się na te wartości.
// Linki specjalne: "{sklep}", "{dolacz}", "{telefon}", "{email}", "#id-sekcji" albo pełny adres URL.

export const CONTENT_VERSION = 1;

export const DEFAULT_SETTINGS = {
  name: "Hubert Paszkiewicz",
  monogram: "H · P",
  role: "Konsultant Raypath",
  phone: "+48 510 085 688",
  email: "bercikhubercik2002@gmail.com",
  shopUrl: "https://hubertpaszkiewicz.raypath.info/Account/Welcome",
  joinUrl: "https://hubertpaszkiewicz.raypath.info/Account/Welcome",
  seoTitle: "Hubert Paszkiewicz – konsultant Raypath | sprzątanie samą wodą, ekologiczna pielęgnacja",
  seoDescription: "Raypath: czyściki z mikrowłókien do sprzątania samą wodą, pielęgnacja ciała i zestawy. Kupuj z osobistym doradztwem u konsultanta Huberta Paszkiewicza.",
  intro: true,
  navEffect: "iris",
  adminLink: true,
  formMode: "mailto",
  footerLegal: "Raypath® i nazwy produktów są znakami towarowymi Raypath International. To strona niezależnego konsultanta, nie oficjalna witryna producenta. Opisy technologii pochodzą z materiałów producenta. Zamówienia realizuje Raypath International zgodnie z regulaminem sklepu.",
  footerPrivacy: "Strona nie używa plików cookies ani narzędzi śledzących. Formularz kontaktowy nie zapisuje danych na stronie."
};

export const DEFAULT_SECTIONS = [
  {
    id: "start", type: "hero", visible: true, inMenu: false, menuLabel: "Start", theme: "dark",
    kicker: "Niezależny konsultant Raypath",
    title: "Czysty dom bez chemii.",
    titleAccent: "Wystarczy woda i dobre włókno.",
    lead: "Nazywam się Hubert Paszkiewicz. Pomogę Ci dobrać produkty Raypath, które naprawdę pasują do Twojego domu – a zamówienie złożysz wygodnie w oficjalnym sklepie online.",
    buttons: [
      { label: "Dobierz produkty w 30 sekund", link: "#dobor", style: "primary" },
      { label: "Przejdź do sklepu", link: "{sklep}", style: "outline" }
    ],
    micro: "Masz pytanie? Zadzwoń – doradzę przed zakupem.",
    photo: "/img/hubert-paszkiewicz.webp",
    photoAlt: "Hubert Paszkiewicz, konsultant Raypath",
    ringText: "Niezależny konsultant · Raypath International · Osobiste doradztwo ·",
    sealTop: "Doradztwo",
    sealBottom: "bez opłat",
    sealLink: "#dobor"
  },
  {
    id: "o-mnie", type: "about", visible: true, inMenu: true, menuLabel: "O mnie", theme: "light",
    kicker: "O mnie",
    title: "Nie sprzedaję katalogu. Doradzam.",
    quote: "Cieszę się, że mogę powitać właśnie Ciebie w Raypath. Jestem do Twojej dyspozycji w sprawach zakupowych i biznesowych.",
    text: "Jestem niezależnym konsultantem Raypath International. Współpracuję bezpośrednio z marką, a każde zamówienie przechodzi przez jej oficjalny system – dlatego masz pewność, że kupujesz oryginał, z pełnymi warunkami producenta.\n\nZanim cokolwiek polecę, pytam: jak wygląda Twój dom, jakie powierzchnie sprzątasz najczęściej i co dziś zajmuje Ci najwięcej czasu. Dopiero wtedy proponuję konkretne produkty. Czasem będzie to mniej, niż planowałeś kupić – i to też jest w porządku.\n\nPo zakupie nie znikam. Pokażę, którym czyścikiem myć szyby, a którym kuchnię, jak je prać i jak o nie dbać, żeby służyły jak najdłużej. Odbieram telefon także po miesiącach.",
    signature: "Hubert Paszkiewicz",
    facts: [
      { value: "100%", label: "oryginalnych produktów z oficjalnego systemu Raypath" },
      { value: "1", label: "osoba do kontaktu – przed zakupem i po nim" },
      { value: "0 zł", label: "za rozmowę i dobór produktów" }
    ],
    principles: [
      { title: "Uczciwa rekomendacja", text: "Polecam tylko to, czego naprawdę potrzebujesz. Nie dokładam produktów „na zapas”." },
      { title: "Oryginał, nie podróbka", text: "Zamawiasz w oficjalnym sklepie Raypath – wysyłkę, płatność i reklamacje obsługuje producent." },
      { title: "Jestem po zakupie", text: "Pomagam przy pierwszym użyciu, praniu czyścików i wymianie zużytych na nowe." },
      { title: "Także w biznesie", text: "Jeśli myślisz o współpracy z Raypath, wyjaśnię zasady konkretnie i bez obietnic bez pokrycia." }
    ]
  },
  {
    id: "marka", type: "pillars", visible: true, inMenu: true, menuLabel: "Marka", theme: "dark",
    bigNumber: "1993",
    bigLabel: "Na rynku od",
    kicker: "Marka Raypath International",
    title: "Ponad trzy dekady sprzątania bez chemii",
    text: "Raypath International tworzy ekologiczne czyściki, które działają z samą wodą – bez płynów i detergentów. Produkty marki trafiają do domów w wielu krajach, głównie europejskich, a oferta obejmuje dziś także pielęgnację ciała, suplementy i biodegradowalne płyny do prania.\n\nSprzedaż odbywa się przez sieć konsultantów – dlatego do każdego zakupu dostajesz człowieka, który wie, jak z produktów korzystać.",
    items: [
      { icon: "drop", title: "Sama woda", text: "Zamiast butelek środków czystości – czyścik i woda z kranu." },
      { icon: "fiber", title: "Mikrowłókno", text: "Włókna cieńsze od włosa, rozszczepione tak, by wciągały brud i tłuszcz." },
      { icon: "shield", title: "Standard GMP", text: "Według producenta zakłady pracują w systemie dobrych praktyk produkcyjnych." },
      { icon: "recycle", title: "Wymiana za pół ceny", text: "Zużyty czyścik oddajesz do recyklingu, a nowy kupujesz za połowę ceny." }
    ]
  },
  {
    id: "historia", type: "timeline", visible: true, inMenu: true, menuLabel: "Historia", theme: "light",
    kicker: "Historia marki",
    title: "Droga Raypath – od pierwszego czyścika do dziś",
    intro: "Ponad trzydzieści lat rozwoju jednej idei: dom może być czysty bez chemii.",
    items: [
      { date: "1993", title: "Początek drogi", text: "Raypath zaczyna oferować ekologiczne czyściki, które sprzątają samą wodą – bez płynów i detergentów. Produkty marki trafiają na rynki wielu krajów, głównie europejskich." },
      { date: "Pierwsze lata", title: "Nowa Technika Czyszczenia", text: "Linia czyścików z dobranych włókien i mikrowłókien trafia do domów i firm. Sprzedaż od początku opiera się na konsultantach, którzy pokazują produkty w praktyce." },
      { date: "Rozwój", title: "Polska firma na świecie", text: "Raypath International to polska spółka z siedzibą pod Krakowem. Z czasem powstają przedstawicielstwa m.in. na Słowacji, w Czechach, na Węgrzech, w Stanach Zjednoczonych i w Kanadzie." },
      { date: "Nanotechnologia", title: "NanoSilver", text: "W strukturę włókien wprowadzone zostaje nanosrebro – technologia, która stała się znakiem rozpoznawczym marki." },
      { date: "Jakość", title: "Normy, GMP i niezależne badania", text: "Produkcja zgodna z polskimi i europejskimi standardami, zakłady w systemie dobrych praktyk produkcyjnych (GMP), a produkty badane w niezależnych ośrodkach naukowych." },
      { date: "Szersza oferta", title: "Nie tylko sprzątanie", text: "Do czyścików dołączają pielęgnacja ECOBody Care, naturalne suplementy diety, linia The Ritual i biodegradowalne płyny do prania." },
      { date: "Dziś", title: "Ekologia w obiegu zamkniętym", text: "Strona marki działa w kilkunastu wersjach językowych, a program recyklingu pozwala oddać zużyty czyścik i kupić nowy za połowę ceny." }
    ],
    note: "Na podstawie informacji publikowanych przez Raypath International i ogólnodostępnych źródeł."
  },
  {
    id: "technologia", type: "tech", visible: true, inMenu: false, menuLabel: "Technologia", theme: "soft",
    kicker: "Jak to działa",
    title: "Technologia, którą czuć pod palcami",
    intro: "Sekret nie tkwi w płynie, tylko w samym włóknie. Dlatego czyścik Raypath potrzebuje wyłącznie wody.",
    items: [
      { title: "Włókno cieńsze od włosa", text: "Według producenta pojedyncze włókno jest wielokrotnie cieńsze od ludzkiego włosa i rozszczepione wzdłuż na mikroskopijne klinowe rowki." },
      { title: "Rowki jak kapilary", text: "Zwilżone wodą rowki wciągają brud, kurz i tłuszcz do wnętrza włókna, zamiast rozmazywać je po powierzchni." },
      { title: "Nanosrebro w strukturze", text: "W strukturę włókien wprowadzone jest nanosrebro – charakterystyczna technologia marki." },
      { title: "Prosta pielęgnacja", text: "Czyścik pierzesz ręcznie mydłem albo w pralce i używasz ponownie – przez długi czas." }
    ],
    note: "Opis technologii na podstawie materiałów producenta. Szczegóły i wyniki badań udostępnia Raypath International."
  },
  {
    id: "porownanie", type: "compare", visible: true, inMenu: false, menuLabel: "Porównanie", theme: "light",
    kicker: "Różnica w praktyce",
    title: "Szafka pełna butelek albo jeden czyścik",
    leftTitle: "Tradycyjnie",
    leftItems: "Osobny płyn do kuchni, łazienki, szyb i mebli\nCo miesiąc nowe zakupy i kolejne plastikowe butelki\nChemiczny zapach i resztki detergentu na blatach\nŚrodki trzymane z dala od dzieci i zwierząt",
    rightTitle: "Z Raypath",
    rightItems: "Czyściki dopasowane do powierzchni i woda z kranu\nJednorazowy zakup na długi czas zamiast stałych wydatków\nBez zapachu chemii i bez detergentu na powierzchniach\nSpokój w domu z dziećmi i zwierzętami"
  },
  {
    id: "kalkulator", type: "calculator", visible: true, inMenu: false, menuLabel: "Kalkulator", theme: "soft",
    kicker: "Policz sam",
    title: "Ile wydajesz na chemię do sprzątania?",
    intro: "Przesuń suwak i zobacz, ile pieniędzy i butelek kosztują Cię środki czystości w dłuższym czasie.",
    min: 20, max: 250, step: 5, value: 60, bottlePrice: 12,
    ctaLabel: "Porównaj z ceną zestawu w sklepie", ctaLink: "{sklep}",
    note: "Szacunek przy średniej cenie butelki 12 zł. Wynik zależy wyłącznie od wpisanej przez Ciebie kwoty."
  },
  {
    id: "dobor", type: "quiz", visible: true, inMenu: true, menuLabel: "Dobór", theme: "dark",
    kicker: "Dobór w 30 sekund",
    title: "Od czego chcesz zacząć?",
    options: [
      { icon: "home", label: "Sprzątanie domu", resultTitle: "Zacznij od czyścików i rękawic", resultText: "To serce marki Raypath: sprzątanie kuchni, łazienki, szyb i mebli samą wodą. Najprościej zacząć od zestawu – zadzwoń, a dobiorę go do Twojego domu.", btnLabel: "Zobacz w sklepie", btnLink: "{sklep}" },
      { icon: "drop", label: "Pielęgnacja ciała", resultTitle: "Linia do pielęgnacji ciała", resultText: "Produkty ECOBody Care do codziennej pielęgnacji twarzy i ciała. Powiedz, czego szukasz, a podpowiem, od czego zacząć.", btnLabel: "Zobacz w sklepie", btnLink: "{sklep}" },
      { icon: "gift", label: "Prezent", resultTitle: "Zestaw na prezent", resultText: "Gotowe komplety Raypath to praktyczny prezent, który zostaje na dłużej. Pomogę wybrać zestaw dopasowany do osoby i budżetu.", btnLabel: "Zobacz zestawy", btnLink: "{sklep}" },
      { icon: "building", label: "Własny biznes", resultTitle: "Porozmawiajmy o współpracy", resultText: "Opowiem, jak wygląda praca konsultanta Raypath, jakie są zasady i od czego zacząć. Bez zobowiązań.", btnLabel: "Dołącz przez Raypath", btnLink: "{dolacz}" }
    ]
  },
  {
    id: "oferta", type: "products", visible: true, inMenu: true, menuLabel: "Oferta", theme: "soft",
    kicker: "Oferta",
    title: "Kolekcja produktów Raypath",
    intro: "Wybierz kategorię – przeniosę Cię do mojego sklepu z aktualnymi cenami.",
    items: [
      { title: "Rękawice i czyściki", text: "Serce marki: do kuchni, łazienki, szyb, podłóg i mebli – z samą wodą", badge: "Dobry start", link: "{sklep}" },
      { title: "Produkty do ciała", text: "Linia ECOBody Care do codziennej pielęgnacji twarzy i ciała", badge: "", link: "{sklep}" },
      { title: "Zestawy", text: "Gotowe komplety – najprostszy sposób, żeby zacząć, i dobry pomysł na prezent", badge: "", link: "{sklep}" },
      { title: "Suplementy diety", text: "Naturalne suplementy jako uzupełnienie codziennej diety", badge: "", link: "{sklep}" },
      { title: "Płyny i aromaty", text: "Biodegradowalne płyny do prania i zapachy do wnętrz", badge: "", link: "{sklep}" },
      { title: "Akcesoria", text: "Mopy, wkłady i dodatki, które uzupełniają system", badge: "", link: "{sklep}" }
    ]
  },
  {
    id: "jak-kupic", type: "steps", visible: true, inMenu: false, menuLabel: "Jak kupić", theme: "light",
    kicker: "Jak kupić",
    title: "Zamówienie w trzech krokach",
    intro: "Zakupy realizujesz w oficjalnym systemie Raypath, w moim sklepie konsultanta. Płatność i dostawę obsługuje Raypath.",
    items: [
      { title: "Wybierz", text: "Przejrzyj kategorie lub poproś mnie o propozycję." },
      { title: "Zamów", text: "Dodaj produkty do koszyka i zapłać online." },
      { title: "Korzystaj", text: "Pokażę, jak używać produktów, żeby działały jak należy." }
    ],
    buttons: [
      { label: "Otwórz sklep", link: "{sklep}", style: "primary" },
      { label: "Poproś o doradztwo", link: "#kontakt", style: "outline" }
    ]
  },
  {
    id: "opinie", type: "testimonials", visible: false, inMenu: false, menuLabel: "Opinie", theme: "soft",
    kicker: "Opinie klientów",
    title: "Co mówią klienci",
    items: [],
    note: "Opinie publikowane za zgodą klientów."
  },
  {
    id: "pytania", type: "faq", visible: true, inMenu: false, menuLabel: "Pytania", theme: "soft",
    kicker: "Pytania",
    title: "Zanim kupisz",
    items: [
      { q: "Czy sama woda naprawdę wystarczy?", a: "Na tym opiera się cała technologia Raypath: rozszczepione mikrowłókna zwilżone wodą zbierają brud i tłuszcz. Najważniejsze jest dobranie czyścika do powierzchni – w tym chętnie pomogę." },
      { q: "Czy kupuję oryginalne produkty?", a: "Tak. Zamówienie składasz w oficjalnym systemie Raypath International, w moim sklepie konsultanta. Produkty wysyła Raypath." },
      { q: "Jak dbać o czyściki?", a: "Wystarczy je regularnie prać – ręcznie z mydłem lub w pralce. Przy pierwszym zakupie pokażę Ci, jak robić to dobrze, żeby służyły jak najdłużej." },
      { q: "Co zrobić ze zużytym czyścikiem?", a: "Raypath prowadzi program wymiany: zużyty czyścik oddajesz do recyklingu, a nowy kupujesz za połowę ceny. Wyjaśnię, jak to zrobić krok po kroku." },
      { q: "Czy doradztwo coś kosztuje?", a: "Nie. Rozmowa i pomoc w doborze produktów są bezpłatne i do niczego nie zobowiązują." }
    ]
  },
  {
    id: "wspolpraca", type: "cta", visible: true, inMenu: false, menuLabel: "Współpraca", theme: "dark",
    kicker: "Współpraca",
    title: "Polecaj produkty, które sam znasz",
    text: "Opowiem, jak wygląda współpraca z Raypath, jakie są zasady i od czego zacząć. Rozmowa do niczego nie zobowiązuje.",
    buttons: [
      { label: "Dołącz przez Raypath", link: "{dolacz}", style: "primary" },
      { label: "Porozmawiajmy", link: "{telefon}", style: "outline" }
    ]
  },
  {
    id: "kontakt", type: "contact", visible: true, inMenu: true, menuLabel: "Kontakt", theme: "light",
    kicker: "Kontakt",
    title: "Zapraszam do rozmowy",
    text: "",
    showPhone: true, showEmail: true, showForm: true,
    topics: "Pytanie o produkty\nDobór produktów\nPomoc w zamówieniu\nWspółpraca z Raypath\nInne",
    consent: "Wyrażam zgodę na kontakt w sprawie mojego zapytania."
  }
];

export function defaultContent() {
  return JSON.parse(JSON.stringify({ v: CONTENT_VERSION, settings: DEFAULT_SETTINGS, sections: DEFAULT_SECTIONS }));
}
