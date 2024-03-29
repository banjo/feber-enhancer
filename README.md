<p align="center">

  <a href="https://github.com/banjo/feber-enhancer">
    <img src="https://i.imgur.com/jNqP3LS.png" alt="Logo" width="150" style="margin-top: 30px;" >
  </a>

  <p align="center">
    Chrome-tillägg med enkla tillägg och funktioner till Feber.
    <br />
  </p>
</p>

---

![Feber Enhancer Demo](./assets/feber-enhancer-demo.png)

## FEBER ENHANCER FUNGERAR INTE LÄNGRE PGA FEBERS NYA UPPDATERING

Feber Enhancer är ett Chrome-tillägg för att underlätta surfandet på [Feber](https://www.feber.se). Små och enkla funkioner har lagts till, såsom sortering, filtrering, röstning och oändlig skroll. Samtliga i thumbnails-vyn. 

# Innehållsförteckning
- [Installera](#dart-installera)
- [Funktioner](#heavy_check_mark-funktioner)
- [Teknologier](#clipboard-teknologier)
- [Utveckla](#cloud-utveckla)
- [Bidra](#wrench-bidra)

___

# :dart: Installera
Tillägget finns tillgängligt på Chrome Web Store [här](https://chrome.google.com/webstore/detail/feber-enhancer/lalfpjhemhlifaceeccaamakenlapobm).

Den kan även laddas hem från [releases](https://github.com/banjo/feber-enhancer/releases/latest).
Installation sker då enligt instruktionerna på [utveckla](#cloud-utveckla)-fliken.


# :heavy_check_mark: Funktioner

## Sortera
![Sortera feber](/assets/feber-sort.gif)

Man kan enkelt sortera de olika artiklarna uteefter vad man är ute efter. Just nu kan man sortera utefter:

* **Hetast**
* **Kallast**
* **Mest kommentarer**
* **Tid (standard)**

## Visa röstning
![Sortera feber](/assets/feber-vote.gif)


Du kan snabbt och enkelt lägga till möjligheten att rösta på artiklarna, utan att behöva gå in i artikeln.

## Oändlig skroll
![Sortera feber](/assets/feber-scroll.gif)


Även om funktionen är högst experimentell, så tillåter den användaren att skrolla vidare utan att behöva byta sida för att få nya artiklar.

## Sök
![Sortera feber](/assets/feber-search.gif)

Sök och filtrera artiklarna som du har laddat för att enkelt hitta något du själv är intresserad av.

## Filtrera författare
![Sortera feber](/assets/feber-author.gif)

Filtrera efter dina favoritförfattare.

## Nya kort
 ![New cards](/assets/new-cards.png)

Välj om du vill använda andra nyhetskort än de vanliga.
# :clipboard: Teknologier
* **Typescript**
* **jQuery**
* **Webpack**

# :cloud: Utveckla

```bash
# klona repo
$ git clone https://github.com/banjo/feber-enhancer.git

# byt till rätt map
$ cd "feber-enhancer"

# installera node-moduler
$ npm install

# starta lokalt
$ npm run watch

# bygg appen
$ npm run build
```

Filerna skapas till `dist`-mappen vid både watch och build. För att inkludera tillägget i Chrome:

* Öppna Chrome
* Gå till inställningarna för tillägg.
* Sätt på **Programmerarläge** högst upp till höger.
* Klicka på **Läser in okomprimerat tillägg**.
* Lägg till `dist`-mappen.


# :wrench: Bidra
Det är fritt fram att bidra, all hjälp uppskattas.
