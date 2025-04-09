// Elements specific to gamePlace.html
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startNewGameButton = document.getElementById('start-new-game');
const soundButton = document.getElementById('sound-button');
const livesContainer = document.getElementById('lives-container'); // Keep this if you added hearts

// --- Popup Elements ---
const questionPopup = document.getElementById('question-popup');
const questionText = document.getElementById('question-text');
const confirmAnswerButton = document.getElementById('confirm-answer');
// Answer buttons are selected dynamically within handleBugClick

// --- Game State Variables ---
let score = 0;
const MAX_LIVES = 3; // Keep if using hearts
let lives = MAX_LIVES; // Keep if using hearts
let timerInterval = null;
let timeLeft = 180; // Default time, will be overwritten by difficulty
let selectedDifficulty = "easy"; // Default difficulty
let currentBug = null; // The bug div element that was clicked
let currentQuestionData = null; // The question object being asked
let selectedAnswerButton = null; // The answer button element that was clicked
let occupiedCells = new Set(); // <<< FIX: To track occupied cells

// --- Grid Constants ---
const MAX_COL = 6;
const MAX_ROW = 4;
const MAX_CELLS = MAX_COL * MAX_ROW;

// --- Bug Images ---
const bugImages = [
    'images/SimpleBug.png', 'images/FastBug.png', 'images/ComplexBug.png', 'images/StrongBug.png'
];

// --- Questions (HTML/CSS/JS Questions) ---
const questions = {
    easy: [
        // HTML Basics
        { question: "Welke tag definieert een paragraaf tekst?", answers: ["<text>", "<p>", "<para>", "<div>"], correct: "<p>" },
        { question: "Welke tag gebruik je voor de belangrijkste kop (titel) op een pagina?", answers: ["<head>", "<h1>", "<title>", "<header>"], correct: "<h1>" },
        { question: "Welke tag maakt een genummerde lijst?", answers: ["<ul>", "<list>", "<ol>", "<dl>"], correct: "<ol>" },
        { question: "Welk attribuut in <img> specificeert de afbeeldings-URL?", answers: ["href", "link", "src", "url"], correct: "src" },
        { question: "Welke tag maakt een hyperlink?", answers: ["<link>", "<a>", "<href>", "<url>"], correct: "<a>" },
        // CSS Basics
        { question: "Welke eigenschap verandert de tekstkleur?", answers: ["font-color", "text-color", "color", "font-style"], correct: "color" },
        { question: "Welke eigenschap stelt de achtergrondkleur in?", answers: ["color", "background", "background-color", "fill-color"], correct: "background-color" },
        { question: "Welk symbool selecteert elementen op basis van hun `class`?", answers: ["#", ".", "*", "&"], correct: "." },
        { question: "Welke eigenschap verandert de lettergrootte?", answers: ["text-size", "font-size", "letter-size", "size"], correct: "font-size" },
        // JS Basics
        { question: "Hoe schrijf je commentaar van één regel?", answers: ["<!-- comment -->", "/* comment */", "// comment", "# comment"], correct: "// comment" },
        { question: "Welk symbool gebruik je voor vermenigvuldigen?", answers: ["x", "*", "%", "/"], correct: "*" },
        { question: "Hoe toon je een pop-up berichtvenster met \"Hallo\"?", answers: ["console.log(\"Hallo\");", "document.write(\"Hallo\");", "alert(\"Hallo\");", "prompt(\"Hallo\");"], correct: "alert(\"Hallo\");" },
        { question: "Welk sleutelwoord declareert een variabele (oudere, function-scoped)?", answers: ["let", "const", "var", "dec"], correct: "var" },
        // Linking Basics
        { question: "Welke tag linkt een extern CSS-bestand?", answers: ["<script>", "<style>", "<css>", "<link>"], correct: "<link>" },
        { question: "Waar plaats je meestal de `<script>` tag voor JavaScript voor betere laadprestaties?", answers: ["Binnen <head>", "Net voor het sluiten van </body>", "Buiten de <html> tag", "Binnen een CSS-bestand"], correct: "Net voor het sluiten van </body>" }
    ],
    medium: [
        // CSS Selectors & Box Model
        { question: "Hoe selecteer je een element met id=\"logo\"?", answers: [".logo", "logo", "#logo", "*logo"], correct: "#logo" },
        { question: "Wat is het verschil tussen `padding` en `margin`?", answers: ["Padding is buiten de border, margin binnen.", "Padding is binnen de border (rond content), margin buiten de border.", "Padding is voor tekst, margin voor afbeeldingen.", "Ze zijn synoniemen."], correct: "Padding is binnen de border (rond content), margin buiten de border." },
        { question: "Wat doet `display: none;`?", answers: ["Maakt het element doorzichtig.", "Verbergt het element en verwijdert het uit de layout flow.", "Verbergt het element maar behoudt de ruimte in de layout.", "Verplaatst het element buiten het scherm."], correct: "Verbergt het element en verwijdert het uit de layout flow." },
        { question: "Hoe centreer je een block-element (met vaste breedte) horizontaal?", answers: ["text-align: center;", "align: center;", "margin: auto;", "margin: 0 auto;"], correct: "margin: 0 auto;" },
        { question: "Wat doet `font-weight: bold;`?", answers: ["Maakt de tekst cursief.", "Maakt de tekst dikgedrukt.", "Vergroot de letterafstand.", "Onderstreept de tekst."], correct: "Maakt de tekst dikgedrukt." },
        // HTML Attributes & Semantics
        { question: "Wat is het doel van het `alt` attribuut in `<img>`?", answers: ["Titel van de afbeelding", "Alternatieve tekst voor toegankelijkheid en als afbeelding niet laadt", "Link van de afbeelding", "Afmetingen van de afbeelding"], correct: "Alternatieve tekst voor toegankelijkheid en als afbeelding niet laadt" },
        { question: "Welke tag groepeer je navigatielinks mee?", answers: ["<navigation>", "<menu>", "<links>", "<nav>"], correct: "<nav>" },
        { question: "Welke tag gebruik je voor een invoerveld in een formulier?", answers: ["<formfield>", "<field>", "<input>", "<entry>"], correct: "<input>" },
        { question: "Welke tag definieert een item in een `<ul>` of `<ol>` lijst?", answers: ["<item>", "<point>", "<li>", "<dd>"], correct: "<li>" },
        // JS DOM & Variables
        { question: "Hoe selecteer je het element met id=\"main\"?", answers: ["document.select(\"#main\")", "document.getElementById(\"main\")", "document.getElement(\"main\")", "document.queryId(\"#main\")"], correct: "document.getElementById(\"main\")" },
        { question: "Hoe voeg je een 'click' event listener toe aan `buttonElement` die `myFunction` aanroept?", answers: ["buttonElement.onclick = myFunction();", "buttonElement.addEventListener(\"click\", myFunction)", "buttonElement.attachEvent(\"click\", myFunction)", "buttonElement.listen(\"click\", myFunction)"], correct: "buttonElement.addEventListener(\"click\", myFunction)" },
        { question: "Wat is het verschil tussen `let` en `const`?", answers: ["`let` is voor getallen, `const` voor strings.", "`let` kan opnieuw toegewezen worden, `const` niet.", "`const` is globaal, `let` lokaal.", "`let` is verouderd."], correct: "`let` kan opnieuw toegewezen worden, `const` niet." },
        { question: "Hoe maak je een array met de waarden 1, 2, 3?", answers: ["let arr = {1, 2, 3};", "let arr = (1, 2, 3);", "let arr = [1, 2, 3];", "let arr = <1, 2, 3>;"], correct: "let arr = [1, 2, 3];" },
        { question: "Welk resultaat geeft `typeof \"hello\"`?", answers: ["\"text\"", "\"string\"", "\"String\"", "\"char\""], correct: "\"string\"" },
        // Linking Paths
        { question: "Je `index.html` is in de root, `style.css` in `css/`. Wat is het `href` attribuut?", answers: ["style.css", "/style.css", "css/style.css", "../css/style.css"], correct: "css/style.css" }
    ],
    hard: [
        // CSS Specificity & Positioning
        { question: "Welke selector heeft de hoogste specificiteit: `div p`, `.item`, `#main`?", answers: ["div p", ".item", "#main", "Ze zijn gelijk."], correct: "#main" },
        { question: "Wat doet `position: relative;` *zonder* `top/left/etc.`?", answers: ["Haalt element uit de flow.", "Centreert het element.", "Creëert een positioneringscontext voor absolute kinderen.", "Niets."], correct: "Creëert een positioneringscontext voor absolute kinderen." },
        { question: "Hoe selecteer je een `<p>` die *direct* na een `<h2>` komt (broer/zus)?", answers: ["h2 p", "h2 > p", "h2 ~ p", "h2 + p"], correct: "h2 + p" },
        { question: "Wat doet `box-sizing: border-box;`?", answers: ["Voegt een border toe.", "Zorgt dat `padding` en `border` binnen de `width`/`height` vallen.", "Optimaliseert afbeeldingen.", "Centreert de box."], correct: "Zorgt dat `padding` en `border` binnen de `width`/`height` vallen." },
        { question: "Wat is het verschil tussen een pseudo-class (`:hover`) en pseudo-element (`::before`)?", answers: ["Syntax: `:` vs `::`.", "Class selecteert staat, element stijlt deel/voegt content toe.", "Class werkt alleen op links, element op divs.", "Elementen zijn nieuwer."], correct: "Class selecteert staat, element stijlt deel/voegt content toe." },
        // JS Concepts & Operators
        { question: "Wat is het verschil tussen `==` en `===`?", answers: ["`==` is sneller.", "`===` is alleen voor objecten.", "`==` doet type coercion, `===` controleert waarde én type.", "Er is geen verschil in modern JS."], correct: "`==` doet type coercion, `===` controleert waarde én type." },
        { question: "Wat is \"hoisting\" in JavaScript?", answers: ["Code sneller maken.", "Declaraties (vooral `var` en `function`) worden conceptueel naar boven verplaatst in hun scope.", "Animaties vloeiender maken.", "Event bubbling voorkomen."], correct: "Declaraties (vooral `var` en `function`) worden conceptueel naar boven verplaatst in hun scope." },
        { question: "Wat is een callback functie?", answers: ["Een functie die zichzelf aanroept.", "Een functie die als argument aan een andere functie wordt meegegeven.", "Een ingebouwde browser functie.", "Een functie die een error retourneert."], correct: "Een functie die als argument aan een andere functie wordt meegegeven." },
        { question: "Wat is het resultaat van `+\"42\"` (unary plus)?", answers: ["\"42\" (string)", "42 (getal)", "NaN", "Error"], correct: "42 (getal)" },
        { question: "Wat doet `event.preventDefault()` in een event handler?", answers: ["Stopt event bubbling.", "Stopt event capturing.", "Voorkomt de standaard browser actie (bv. form submit, link volgen).", "Verwijdert de event listener."], correct: "Voorkomt de standaard browser actie (bv. form submit, link volgen)." },
        // HTML Semantics & Data Attributes
        { question: "Wanneer gebruik je `<article>` vs `<section>`?", answers: ["`<article>` voor blogs, `<section>` voor de rest.", "`<article>` is op zichzelf staande content, `<section>` thematische groepering.", "`<section>` moet binnen `<article>`.", "Ze zijn functioneel identiek."], correct: "`<article>` is op zichzelf staande content, `<section>` thematische groepering." },
        { question: "Wat is het doel van `data-*` attributen?", answers: ["SEO optimalisatie.", "Validatie van formulieren.", "Eigen data koppelen aan elementen, vaak voor JS.", "Styling hooks voor CSS."], correct: "Eigen data koppelen aan elementen, vaak voor JS." },
        { question: "Wat is het semantische verschil tussen `<b>` en `<strong>`?", answers: ["Geen, ze zijn hetzelfde.", "`<b>` is visueel vet, `<strong>` duidt belangrijkheid aan (vaak ook vet).", "`<strong>` is nieuwer en vervangt `<b>`.", "`<b>` is voor titels, `<strong>` voor tekst."], correct: "`<b>` is visueel vet, `<strong>` duidt belangrijkheid aan (vaak ook vet)." },
        // Linking & Flexbox
        { question: "Je bent in `project/js/main.js`. Hoe link je naar `project/assets/image.png`?", answers: ["assets/image.png", "/assets/image.png", "../assets/image.png", "../../assets/image.png"], correct: "../assets/image.png" },
        { question: "Hoe gebruik je Flexbox om items aan het *einde* van de hoofd-as te plaatsen?", answers: ["justify-content: center;", "justify-content: space-between;", "justify-content: flex-end;", "align-items: flex-end;"], correct: "justify-content: flex-end;" }
    ],
    expert: [
        // Advanced JS Concepts
        { question: "Wat is een \"closure\" (afsluiting)?", answers: ["Een manier om code te verbergen.", "Een functie die toegang heeft tot variabelen uit zijn omliggende (lexicale) scope, zelfs nadat die scope is afgesloten.", "Een synoniem voor een anonieme functie.", "Een techniek om recursie te optimaliseren."], correct: "Een functie die toegang heeft tot variabelen uit zijn omliggende (lexicale) scope, zelfs nadat die scope is afgesloten." },
        { question: "Wat is het belangrijkste verschil tussen `localStorage` en `sessionStorage`?", answers: ["`localStorage` is sneller.", "`sessionStorage` kan meer data opslaan.", "`localStorage` data blijft bewaard na sluiten browser, `sessionStorage` niet.", "`localStorage` is alleen voor strings."], correct: "`localStorage` data blijft bewaard na sluiten browser, `sessionStorage` niet." },
        { question: "Wat doet `Promise.all()`?", answers: ["Voert alle promises na elkaar uit.", "Wacht tot alle meegegeven promises zijn resolved (of één rejected).", "Selecteert de snelste promise.", "Converteert callbacks naar promises."], correct: "Wacht tot alle meegegeven promises zijn resolved (of één rejected)." },
        { question: "Wat is het verschil tussen `map()` en `forEach()` op een array?", answers: ["`map()` is sneller.", "`forEach()` kan de array wijzigen, `map()` niet.", "`map()` retourneert een *nieuwe* array met resultaten, `forEach()` retourneert `undefined`.", "`forEach()` werkt alleen op getallen."], correct: "`map()` retourneert een *nieuwe* array met resultaten, `forEach()` retourneert `undefined`." },
        { question: "Wat is \"event delegation\"?", answers: ["Een event doorgeven aan een andere functie.", "Een event listener op een *parent* element plaatsen om events van *child* elementen af te vangen.", "Een custom event maken.", "preventDefault() aanroepen."], correct: "Een event listener op een *parent* element plaatsen om events van *child* elementen af te vangen." },
        { question: "Wat is het doel van `async`/`await`?", answers: ["Code synchroon maken.", "Asynchrone (Promise-based) code schrijven op een meer synchroon lijkende manier.", "Callbacks vervangen door events.", "Multi-threading introduceren."], correct: "Asynchrone (Promise-based) code schrijven op een meer synchroon lijkende manier." },
        // Advanced CSS Concepts
        { question: "Wat is het doel van CSS Custom Properties (variabelen)?", answers: ["Code korter maken.", "Waarden herbruikbaar maken en centraal beheren binnen CSS.", "CSS sneller laten laden.", "Alleen voor animaties."], correct: "Waarden herbruikbaar maken en centraal beheren binnen CSS." },
        { question: "Hoe maak je met CSS Grid een layout met 3 kolommen van gelijke breedte?", answers: ["grid-columns: 3;", "grid-template-columns: 33% 33% 33%;", "grid-template-columns: repeat(3, 1fr);", "grid-layout: columns(3);"], correct: "grid-template-columns: repeat(3, 1fr);" },
        { question: "Wat is een \"stacking context\"?", answers: ["Hoe elementen horizontaal worden gestapeld.", "Een groep elementen waarin `z-index` waarden alleen ten opzichte van elkaar gelden.", "De volgorde van CSS regels in een bestand.", "Een techniek voor responsive design."], correct: "Een groep elementen waarin `z-index` waarden alleen ten opzichte van elkaar gelden." },
        { question: "Hoe selecteer je een `<a>` element waarvan het `href` attribuut begint met \"https://\"?", answers: ["a[href^=\"https://\"]", "a[href*=\"https://\"]", "a[href$=\"https://\"]", "a[href=\"^https://\"]"], correct: "a[href^=\"https://\"]" },
        { question: "Wat is het verschil tussen `visibility: hidden;` en `display: none;`?", answers: ["Geen verschil.", "`visibility: hidden` verbergt element maar behoudt ruimte, `display: none` verwijdert het uit de flow.", "`display: none` is voor tekst, `visibility: hidden` voor afbeeldingen.", "`visibility: hidden` kan geanimeerd worden, `display: none` niet."], correct: "`visibility: hidden` verbergt element maar behoudt ruimte, `display: none` verwijdert het uit de flow." },
        // Advanced HTML & Accessibility
        { question: "Wat is het nut van `defer` attribuut op een `<script>` tag?", answers: ["Script pas laden na de rest van de pagina.", "Script asynchroon laden, maar uitvoeren na HTML parsing, in volgorde.", "Script asynchroon laden en uitvoeren zodra beschikbaar, volgorde niet gegarandeerd.", "Script alleen uitvoeren bij user interactie."], correct: "Script asynchroon laden, maar uitvoeren na HTML parsing, in volgorde." },
        { question: "Wat is het doel van `aria-label` attribuut?", answers: ["Een label voor formulier elementen.", "Een toegankelijkheidslabel voor screenreaders, overschrijft element inhoud.", "Een CSS selector hook.", "Metadata voor zoekmachines."], correct: "Een toegankelijkheidslabel voor screenreaders, overschrijft element inhoud." },
        { question: "Wat doet de `<template>` tag?", answers: ["Definieert een herbruikbaar HTML sjabloon dat niet direct gerenderd wordt.", "Stelt het thema van de pagina in.", "Is een container voor metadata.", "Is verouderd en vervangen door `<div>`."], correct: "Definieert een herbruikbaar HTML sjabloon dat niet direct gerenderd wordt." },
        // CSS Calc with Variables
        { question: "Hoe kun je CSS variabelen gebruiken binnen `calc()`?", answers: ["width: calc(var(--breedte) + 10px);", "width: calc(--breedte + 10px);", "width: calc(var(breedte) + 10px);", "Dat is niet mogelijk."], correct: "width: calc(var(--breedte) + 10px);" }
    ],
    insane: [
        // Deep JS Concepts
        { question: "Wat is het verschil tussen macrotask (bv. `setTimeout`) en microtask (bv. `Promise.then`)?", answers: ["Microtasks hebben altijd voorrang en worden uitgevoerd vóór de volgende macrotask.", "Macrotasks zijn sneller.", "Microtasks kunnen alleen in web workers.", "Ze zijn synoniemen."], correct: "Microtasks hebben altijd voorrang en worden uitgevoerd vóór de volgende macrotask." },
        { question: "Wat is het verschil tussen `WeakMap` en `Map`?", answers: ["`WeakMap` kan alleen objecten als sleutels hebben en voorkomt memory leaks.", "`WeakMap` is sneller voor kleine datasets.", "`Map` kan geen primitieve waarden opslaan.", "`WeakMap` is alleen beschikbaar in Node.js."], correct: "`WeakMap` kan alleen objecten als sleutels hebben en voorkomt memory leaks." },
        { question: "Wat doet `Object.freeze()`?", answers: ["Maakt een object onzichtbaar.", "Voorkomt het toevoegen, verwijderen of wijzigen van eigenschappen (ondiepe bevriezing).", "Converteert een object naar JSON.", "Maakt een diepe kopie van een object."], correct: "Voorkomt het toevoegen, verwijderen of wijzigen van eigenschappen (ondiepe bevriezing)." },
        { question: "Wat is een Generator functie (`function*`)?", answers: ["Een functie die willekeurige getallen genereert.", "Een functie die gepauzeerd en hervat kan worden, en meerdere waarden kan opleveren via `yield`.", "Een synoniem voor een `async` functie.", "Een functie die HTML genereert."], correct: "Een functie die gepauzeerd en hervat kan worden, en meerdere waarden kan opleveren via `yield`." },
        { question: "Wat is het resultaat van `typeof null`?", answers: ["\"null\"", "\"undefined\"", "\"object\"", "\"None\""], correct: "\"object\"" },
        { question: "Wat is het doel van `Symbol`?", answers: ["Een icoon weergeven.", "Een unieke en onveranderlijke waarde creëren, vaak gebruikt als object property key.", "Een wiskundig symbool invoegen.", "Een alias voor een string."], correct: "Een unieke en onveranderlijke waarde creëren, vaak gebruikt als object property key." },
        { question: "Wat is Tree Shaking in de context van JavaScript modules?", answers: ["Code automatisch formatteren.", "Proces waarbij ongebruikte code (exports) wordt verwijderd tijdens het bundelen.", "Fouten opsporen in de dependency tree.", "Volgorde van scriptuitvoering optimaliseren."], correct: "Proces waarbij ongebruikte code (exports) wordt verwijderd tijdens het bundelen." },
        // Deep CSS / Browser Internals
        { question: "Wat is het doel van de `:where()` pseudo-class?", answers: ["Selecteert elementen op een specifieke locatie.", "Groepeert selectors zonder de specificiteit te verhogen.", "Is een alternatief voor `!important`.", "Selecteert elementen binnen een Shadow DOM."], correct: "Groepeert selectors zonder de specificiteit te verhogen." },
        { question: "Wat zijn CSS Houdini API's (conceptueel)?", answers: ["Low-level API's die toegang geven tot de CSS engine van de browser.", "Een nieuwe manier om CSS te schrijven met JavaScript.", "Een tool om CSS te debuggen.", "Een framework zoals Bootstrap."], correct: "Low-level API's die toegang geven tot de CSS engine van de browser." },
        { question: "Hoe werkt `z-index` precies in relatie tot stacking contexts?", answers: ["Hogere `z-index` is altijd bovenop.", "`z-index` werkt alleen binnen dezelfde stacking context; positie van context telt ook.", "`z-index` werkt alleen op `position: absolute`.", "Negatieve `z-index` plaatst achter de root."], correct: "`z-index` werkt alleen binnen dezelfde stacking context; positie van context telt ook." },
        { question: "Wat zijn Container Queries (conceptueel)?", answers: ["Media queries gebaseerd op browser grootte.", "Queries die stijlen toepassen op basis van de grootte van de *container*.", "Queries om database informatie op te halen.", "Een manier om CSS variabelen te bevragen."], correct: "Queries die stijlen toepassen op basis van de grootte van de *container*." },
        { question: "Wat doet de `will-change` eigenschap?", answers: ["Verandert de stijl dynamisch.", "Geeft de browser een hint welke eigenschappen gaan animeren voor optimalisatie.", "Voorkomt dat een eigenschap verandert.", "Is nodig om CSS variabelen te gebruiken."], correct: "Geeft de browser een hint welke eigenschappen gaan animeren voor optimalisatie." },
        // Deep HTML / Browser Internals
        { question: "Wat is de Shadow DOM?", answers: ["Een verborgen kopie van de DOM.", "Manier om DOM structuur van een component te encapsuleren (stijl/structuur afschermen).", "DOM voor server-side rendering.", "Een verouderde specificatie."], correct: "Manier om DOM structuur van een component te encapsuleren (stijl/structuur afschermen)." },
        { question: "Wat is het verschil tussen `defer` en `async` voor scripts?", answers: ["`defer` laadt na, `async` tijdens.", "Beide asynchroon; `async` voert uit zodra klaar (onbepaalde volgorde), `defer` na HTML parsing (in volgorde).", "`async` is sneller.", "`defer` extern, `async` inline."], correct: "Beide asynchroon; `async` voert uit zodra klaar (onbepaalde volgorde), `defer` na HTML parsing (in volgorde)." },
        { question: "Wat is het semantische verschil tussen `<b>`/`<i>` en `<strong>`/`<em>`?", answers: ["Geen, oud vs nieuw.", "`b`/`i` presentationeel (vet/cursief), `strong`/`em` belang/nadruk (vaak resulterend in vet/cursief).", "`strong`/`em` voor accessibility.", "`b`/`i` inline, `strong`/`em` block."], correct: "`b`/`i` presentationeel (vet/cursief), `strong`/`em` belang/nadruk (vaak resulterend in vet/cursief)." }
    ],
    impossible: [
        // JS Quirks & Edge Cases
        { question: "Wat is het resultaat van `[] + {}`?", answers: ["\"{}\"", "0", "\"[object Object]\"", "NaN"], correct: "\"[object Object]\"" },
        { question: "Wat is het resultaat van `{} + []`?", answers: ["\"[object Object]\"", "0", "\"{}\"", "SyntaxError"], correct: "0" },
        { question: "Wat doet de (zeer afgeraden) `with` statement?", answers: ["Voert code uit binnen de context van een object, properties direct toegankelijk.", "Combineert variabelen.", "Alternatief voor `try...catch`.", "Werkt alleen met `window`."], correct: "Voert code uit binnen de context van een object, properties direct toegankelijk." },
        { question: "Wat is het resultaat van `NaN === NaN`?", answers: ["true", "false", "undefined", "TypeError"], correct: "false" },
        { question: "Wat is Temporal Dead Zone (TDZ) gerelateerd aan `let` en `const`?", answers: ["Tijd dat variabele nog niet gedeclareerd is.", "Periode tussen scope start en declaratie waar toegang een `ReferenceError` geeft.", "Performance bottleneck.", "Time-out voor async operaties."], correct: "Periode tussen scope start en declaratie waar toegang een `ReferenceError` geeft." },
        { question: "Wat is het resultaat van `Array.isArray(arguments)` binnen een *niet*-arrow functie?", answers: ["true", "false", "undefined", "TypeError"], correct: "false" },
        { question: "Kan een `<script>` tag die via `innerHTML` wordt toegevoegd, direct worden uitgevoerd?", answers: ["Ja, altijd.", "Nee, om veiligheidsredenen meestal niet.", "Alleen als extern script.", "Alleen in oudere browsers."], correct: "Nee, om veiligheidsredenen meestal niet." },
        // CSS History & Specificity Quirks
        { question: "Welke CSS eigenschap werd historisch (incorrect) gebruikt voor layout?", answers: ["position: absolute", "display: table", "float", "margin: auto"], correct: "float" },
        { question: "Wat is de specificiteit van een inline stijl (`style=\"...\"`)?", answers: ["0,1,0,0", "0,0,1,0", "1,0,0,0", "0,0,0,1"], correct: "1,0,0,0" },
        { question: "Wat is het verschil in specificiteit tussen `:is(.a, #b)` en `:where(.a, #b)`?", answers: ["Geen verschil.", "`:is()` neemt specificiteit van hoogste (`#b`), `:where()` heeft specificiteit 0.", "`:where()` is hoger.", "Beide specificiteit 0."], correct: "`:is()` neemt specificiteit van hoogste (`#b`), `:where()` heeft specificiteit 0." },
        { question: "Wat was een veelvoorkomend probleem met `float`-based layouts (clearfix hack)?", answers: ["Floats overlapten elkaar.", "Container van floats 'klapte in' (hoogte 0).", "Floats werkten niet in IE.", "Tekst kon niet om floats lopen."], correct: "Container van floats 'klapte in' (hoogte 0)." },
        { question: "Wat gebeurt er als je `!important` gebruikt op een eigenschap binnen `@keyframes`?", answers: ["Animatie wordt geforceerd.", "`!important` wordt genegeerd binnen keyframes.", "Animatie stopt.", "Alleen die keyframe wordt `!important`."], correct: "`!important` wordt genegeerd binnen keyframes." },
        // HTML History & Obscure Tags
        { question: "Wat was het doel van de (nu obsolete) `<blink>` tag?", answers: ["Link laten knipperen.", "Tekst laten knipperen.", "Afbeelding snel wisselen.", "Geluid afspelen bij hover."], correct: "Tekst laten knipperen." },
        { question: "Welk effect heeft het ontbreken van een `DOCTYPE` declaratie meestal?", answers: ["Pagina laadt niet.", "Browser schakelt naar \"Quirks Mode\".", "JavaScript wordt uitgeschakeld.", "CSS wordt genegeerd."], correct: "Browser schakelt naar \"Quirks Mode\"." },
        { question: "Wat is de functie van het (zelden gebruikte) `<bdo>` element?", answers: ["Maakt tekst vet en onderstreept.", "Overschrijft de standaard tekstrichting (Bi-Directional Override).", "Definieert data binding.", "Container voor `<b>` en `<del>`."], correct: "Overschrijft de standaard tekstrichting (Bi-Directional Override)." }
    ]
};


// --- Helper Functions ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomQuestion(difficulty = "easy") {
    // Ensure the difficulty exists, otherwise default to easy
    const difficultyKey = questions.hasOwnProperty(difficulty) ? difficulty : 'easy';
    const questionSet = questions[difficultyKey];

    if (!questionSet || questionSet.length === 0) {
        console.error("No questions found for difficulty:", difficultyKey, "(original:", difficulty, ")");
        // Return a fallback question to prevent crashes
        const fallback = { question: "Error: No question found.", answers: ["OK", "OK", "OK", "OK"], correct: "OK" };
        fallback.shuffledAnswers = [...fallback.answers]; // Add shuffledAnswers property
        return fallback;
    }

    const randomIndex = Math.floor(Math.random() * questionSet.length);
    // Clone the question object to avoid modifying the original
    const question = { ...questionSet[randomIndex] };

    // Ensure there are always 4 answers, padding with "N/A" if necessary
    while (question.answers.length < 4) {
        console.warn(`Question "${question.question}" has less than 4 answers. Padding.`);
        question.answers.push("N/A");
    }
    // Ensure we don't have more than 4 answers
    question.answers = question.answers.slice(0, 4);

    // Create shuffled answers array
    let shuffledAnswers = [...question.answers];
    shuffleArray(shuffledAnswers);
    question.shuffledAnswers = shuffledAnswers; // Add this property to the object

    return question;
}

// --- Function to update lives display (if using hearts) ---
function updateLivesDisplay() {
    if (!livesContainer) {
        // console.warn("Lives container not found, cannot update display.");
        return; // Exit if container not found
    }
    livesContainer.innerHTML = ''; // Clear for new hearts
    for (let i = 1; i <= MAX_LIVES; i++) {
        const heart = document.createElement('span');
        heart.classList.add('heart');
        heart.textContent = '♥'; // Use a heart character
        if (i > lives) {
            heart.classList.add('heart-lost'); // Style for lost hearts
        }
        livesContainer.appendChild(heart);
    }
}


function startTimer(duration, displayElement) {
    if (timerInterval) clearInterval(timerInterval);
    let timer = duration;
    timeLeft = duration;

    timerInterval = setInterval(() => {
        if (!displayElement) {
             clearInterval(timerInterval);
             return;
        }
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        displayElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeLeft = timer;

        if (timer <= 0) {
            clearInterval(timerInterval);
            gameOver("Time's up!");
        }
        timer--;
    }, 1000);
}

// --- MODIFIED spawnBug Function ---
function spawnBug() {
    if (!gameContainer) {
        console.error("Game container not found, cannot spawn bug.");
        return;
    }

    // <<< FIX 1: Check if grid is already full >>>
    if (occupiedCells.size >= MAX_CELLS) {
        console.warn("Grid is full, cannot spawn more bugs.");
        return; // Don't spawn if no space left
    }

    const bug = document.createElement('div');
    bug.classList.add('bug');

    let col, row, cellKey, attempts = 0;
    const maxAttempts = MAX_CELLS * 2; // Increased attempts limit

    // <<< FIX 2: Use occupiedCells Set for checking >>>
    do {
        col = Math.floor(Math.random() * MAX_COL) + 1;
        row = Math.floor(Math.random() * MAX_ROW) + 1;
        cellKey = `c${col}r${row}`; // Create a unique key like "c3r2"
        attempts++;
        if (attempts > maxAttempts) {
             console.error(`Could not find empty spot for bug after ${maxAttempts} attempts. Aborting spawn.`);
             return; // Stop trying
        }
    } while (occupiedCells.has(cellKey)); // Check if the Set already has this key

    // <<< FIX 3: Add the new cell to the Set and store key on element >>>
    occupiedCells.add(cellKey);
    bug.dataset.cellKey = cellKey; // Store the key for later removal

    bug.style.gridColumn = col;
    bug.style.gridRow = row;

    const img = document.createElement('img');
    img.src = bugImages[Math.floor(Math.random() * bugImages.length)];
    img.alt = 'Bug';
    img.onerror = () => { bug.style.backgroundColor = 'red'; bug.textContent = 'X'; };
    bug.appendChild(img);

    bug.addEventListener('click', () => handleBugClick(bug));

    gameContainer.appendChild(bug);
    // console.log(`Bug spawned at ${col}, ${row} (Key: ${cellKey}). Occupied: ${occupiedCells.size}`);
}
// --- END OF MODIFIED spawnBug ---


// --- Handle Bug Click (Opens Popup) ---
function handleBugClick(clickedBug) {
    // console.log("handleBugClick triggered for bug:", clickedBug); // Log: Start of function

    if (!questionPopup) {
        console.error("Question popup element not found!");
        return;
    }
    if (!questionPopup.classList.contains('hidden')) {
        // console.warn("handleBugClick called while popup is already visible.");
        return;
    }
    if (currentQuestionData || currentBug) {
         // console.warn("handleBugClick called while another question is active.");
         return;
    }

    // console.log("Proceeding to open popup..."); // Log: Checks passed

    currentBug = clickedBug; // Store reference to the clicked bug DIV
    currentQuestionData = getRandomQuestion(selectedDifficulty);
    selectedAnswerButton = null; // Reset selected answer button

    if (!questionText) {
        console.error("Question text element not found!");
        currentBug = null; // Reset state
        currentQuestionData = null;
        return; // Cannot proceed
    }
    questionText.textContent = currentQuestionData.question;

    const currentAnswerButtons = questionPopup.querySelectorAll('.answers .answer');
    if (currentAnswerButtons.length !== 4) {
        console.error("Expected 4 answer buttons, found:", currentAnswerButtons.length);
        currentBug = null; // Reset state
        currentQuestionData = null;
        return; // Cannot proceed
    }

    try {
        if (!currentQuestionData.shuffledAnswers || currentQuestionData.shuffledAnswers.length !== 4) {
             console.error("Shuffled answers missing/incorrect length for question:", currentQuestionData.question);
             if (currentQuestionData.answers && currentQuestionData.answers.length === 4) {
                 console.warn("Attempting recovery by shuffling original answers.");
                 currentQuestionData.shuffledAnswers = [...currentQuestionData.answers];
                 shuffleArray(currentQuestionData.shuffledAnswers);
             } else {
                 throw new Error("Cannot proceed without valid shuffled answers.");
             }
        }

        currentAnswerButtons.forEach((button, index) => {
            const answerText = currentQuestionData.shuffledAnswers[index];
            const newButton = button.cloneNode(true); // Clone to remove listeners
            newButton.textContent = answerText;
            newButton.dataset.answerValue = answerText; // Store the actual answer value
            newButton.classList.remove('selected'); // Ensure clone is not selected
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            } else {
                 console.error("Button parent node not found during replacement.");
            }
            newButton.addEventListener('click', handleAnswerSelection);
        });
    } catch (error) {
        console.error("Error during button setup:", error);
        if(questionPopup) questionPopup.classList.add('hidden'); // Hide popup on error
        currentBug = null; // Reset state on error
        currentQuestionData = null;
        return; // Stop execution if button setup fails
    }

    // console.log("Removing 'hidden' class to show popup."); // Log: About to show
    questionPopup.classList.remove('hidden');
    // console.log("Popup should be visible. Hidden class present?", questionPopup.classList.contains('hidden')); // Log: Verify class removal
}


// --- Handle Answer Selection (Highlights Button) ---
function handleAnswerSelection(event) {
    const currentAnswerButtons = questionPopup.querySelectorAll('.answers .answer');
    currentAnswerButtons.forEach(btn => btn.classList.remove('selected'));
    selectedAnswerButton = event.target; // The button element that was clicked
    if (selectedAnswerButton) {
        selectedAnswerButton.classList.add('selected');
        // console.log("Selected answer:", selectedAnswerButton.dataset.answerValue);
    }
}

// --- MODIFIED Handle Answer Confirmation ---
function confirmAnswer() {
    // console.log("confirmAnswer triggered.");

    if (!selectedAnswerButton) {
        alert('Please select an answer!');
        return;
    }
    if (!currentQuestionData || !currentBug) {
        console.error("Missing question data or bug reference on confirm.");
        if (questionPopup) questionPopup.classList.add('hidden');
        currentBug = null;
        currentQuestionData = null;
        selectedAnswerButton = null;
        return;
    }

    const selectedValue = selectedAnswerButton.dataset.answerValue;
    const correctAnswer = currentQuestionData.correct;
    // console.log(`Selected: ${selectedValue}, Correct: ${correctAnswer}`);

    const currentAnswerButtons = questionPopup.querySelectorAll('.answers .answer');
    let isCorrect = (selectedValue === correctAnswer);

    // Visual feedback (Optional: Keep or remove color changes)
    currentAnswerButtons.forEach(button => {
        button.style.transition = 'background-color 0.3s ease';
        if (button.dataset.answerValue === correctAnswer) {
            button.style.backgroundColor = '#5cb85c'; // Green
            button.style.color = '#fff';
        } else if (button === selectedAnswerButton && !isCorrect) {
            button.style.backgroundColor = '#d9534f'; // Red
            button.style.color = '#fff';
        } else {
             button.style.backgroundColor = '';
             button.style.color = '';
        }
    });

    if (isCorrect) {
        // CORRECT
        // console.log("Answer CORRECT");
        const correctAnswerSound = document.getElementById('correct-answer-sound');
        if (correctAnswerSound) {
            correctAnswerSound.currentTime = 0;
            correctAnswerSound.play();
        }
        score += 10;
        if (scoreDisplay) scoreDisplay.textContent = score;

        // <<< FIX 4: Remove cell from occupiedCells Set >>>
        const cellKeyToRemove = currentBug.dataset.cellKey;
        if (cellKeyToRemove) {
            occupiedCells.delete(cellKeyToRemove);
            // console.log(`Removed ${cellKeyToRemove}. Occupied: ${occupiedCells.size}`);
        } else {
            console.warn("Bug element missing cellKey dataset on removal.");
        }

        currentBug.remove(); // Remove the bug div
        checkWinCondition(); // Check if player won

    } else {
        // INCORRECT
        // console.log("Answer INCORRECT");
        const wrongAnswerSound = document.getElementById('wrong-answer-sound');
        if (wrongAnswerSound) {
            wrongAnswerSound.currentTime = 0;
            wrongAnswerSound.play();
        }
        lives--;
        updateLivesDisplay(); // Update hearts display
        // console.log("Lives left:", lives);

        // Show alert *after* updating hearts
        // setTimeout(() => { alert(`Incorrect! Correct: ${correctAnswer}`); }, 100);

        if (lives <= 0) {
            setTimeout(() => gameOver("You ran out of lives!"), 500); // Delay game over
            return; // Stop further execution
        } else {
            // Spawning bugs moved to the cleanup timeout below
            // console.log("Will spawn 2 bugs after delay.");
        }
    }

    // --- Cleanup and Hide Popup (Delay for feedback) ---
    setTimeout(() => {
        if (questionPopup) questionPopup.classList.add('hidden');

        // Spawn new bugs here if the answer was incorrect and game is not over
        if (!isCorrect && lives > 0) {
             // console.log("Spawning 2 bugs now.");
             spawnBug();
             spawnBug();
        }

        currentBug = null;
        currentQuestionData = null;
        selectedAnswerButton = null;

        // Reset button styles
        currentAnswerButtons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.transition = '';
        });
    }, 1500); // 1.5 second delay
}
// --- END OF MODIFIED confirmAnswer ---


// --- MODIFIED Start Game ---
function startGame() {
    console.log("Starting new game...");
    // Include livesContainer in check if using hearts
    if (!gameContainer || !startNewGameButton || !timeDisplay || !scoreDisplay || !questionPopup || !livesContainer) {
        console.error("Required elements not found. Cannot start game.");
        return;
    }

    const storedDifficulty = localStorage.getItem('selectedDifficulty');
    if (storedDifficulty && questions.hasOwnProperty(storedDifficulty)) {
        selectedDifficulty = storedDifficulty;
    } else {
        console.warn(`Stored difficulty "${storedDifficulty}" invalid. Defaulting to easy.`);
        selectedDifficulty = 'easy';
        localStorage.setItem('selectedDifficulty', 'easy');
    }
    console.log("Difficulty set to:", selectedDifficulty);

    score = 0;
    lives = MAX_LIVES; // Reset lives
    occupiedCells.clear(); // <<< FIX 5: Clear occupied cells on new game >>>
    if(scoreDisplay) scoreDisplay.textContent = score;
    updateLivesDisplay(); // Update hearts display
    if(gameContainer) gameContainer.innerHTML = ''; // Clear board
    if(questionPopup) questionPopup.classList.add('hidden'); // Ensure popup is hidden

    let gameDuration;
    switch (selectedDifficulty) {
        case 'medium':      gameDuration = 150; break;
        case 'hard':        gameDuration = 120; break;
        case 'expert':      gameDuration = 90;  break;
        case 'insane':      gameDuration = 60;  break;
        case 'impossible':  gameDuration = 45;  break;
        default:            gameDuration = 180; break;
    }
    console.log(`Game duration set to: ${gameDuration} seconds`);

    const initialBugCount = 5;
    for (let i = 0; i < initialBugCount; i++) {
        spawnBug();
    }

    startTimer(gameDuration, timeDisplay);
    if(startNewGameButton) startNewGameButton.disabled = true;
}
// --- END OF MODIFIED startGame ---


// --- MODIFIED Game Over ---
function gameOver(message) {
    console.log("Game Over:", message);
    if (timerInterval) clearInterval(timerInterval);

    lives = 0; // Ensure lives are 0
    updateLivesDisplay(); // Update hearts display
    occupiedCells.clear(); // <<< FIX 6: Clear occupied cells on game over >>>

    if (gameContainer) {
        gameContainer.innerHTML = ''; // Clear bugs
        const gameOverMessage = document.createElement('div');
        gameOverMessage.classList.add('game-over-message');
        // Added <br> for better formatting in your original code
        gameOverMessage.innerHTML = `
            Game Over!<br>
            ${message}<br>
            Final Score: ${score}
        `;
        gameContainer.appendChild(gameOverMessage);
    }

    if (startNewGameButton) startNewGameButton.disabled = false;
    if (questionPopup) questionPopup.classList.add('hidden');
    currentBug = null;
    currentQuestionData = null;
    selectedAnswerButton = null;
}
// --- END OF MODIFIED gameOver ---


// --- MODIFIED Check Win Condition ---
function checkWinCondition() {
    // Check based on occupiedCells size being 0 (more reliable than children count)
    // Also ensure game isn't already over (lives > 0)
    if (occupiedCells.size === 0 && lives > 0) {
        // Add a small delay to ensure no other actions interfere
        setTimeout(() => {
            // Double check if still 0 and game not over
            if (occupiedCells.size === 0 && lives > 0 && !document.getElementById('win-popup-id')) {
                 displayWinPopup();
            }
        }, 300); // Short delay
    }
}
// --- END OF MODIFIED checkWinCondition ---


// --- MODIFIED Display Win Popup ---
function displayWinPopup() {
    if (timerInterval) clearInterval(timerInterval); // Stop timer on win
    console.log("You Win!");

    if (document.getElementById('win-popup-id')) return; // Prevent multiple popups

    occupiedCells.clear(); // <<< FIX 7: Clear occupied cells on win >>>

    const winPopup = document.createElement('div');
    winPopup.id = 'win-popup-id';
    winPopup.classList.add('popup', 'win-popup'); // Use specific class if needed
    winPopup.innerHTML = `
        <div class="popup-content">
            <p>Congratulations!<br>You Busted All Bugs!</p>
            <p>Final Score: ${score}</p>
            <button id="restart-game-win" class="confirm-button">Play Again</button>
        </div>
    `;
    document.body.appendChild(winPopup);

    const restartButton = document.getElementById('restart-game-win');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            winPopup.remove();
            if(startNewGameButton) startNewGameButton.disabled = false; // Re-enable start button

            // Reset displays for next game start visual cue
            if(scoreDisplay) scoreDisplay.textContent = 0;
            let initialDifficulty = localStorage.getItem('selectedDifficulty') || 'easy';
            if (!questions.hasOwnProperty(initialDifficulty)) initialDifficulty = 'easy';
            let initialDuration;
            switch (initialDifficulty) {
                 case 'medium': initialDuration = 150; break;
                 case 'hard': initialDuration = 120; break;
                 case 'expert': initialDuration = 90; break;
                 case 'insane': initialDuration = 60; break;
                 case 'impossible': initialDuration = 45; break;
                 default: initialDuration = 180; break;
            }
            if(timeDisplay) {
                 const initialMinutes = Math.floor(initialDuration / 60);
                 const initialSeconds = initialDuration % 60;
                 timeDisplay.textContent = `${initialMinutes}:${initialSeconds < 10 ? '0' : ''}${initialSeconds}`;
            }
            lives = MAX_LIVES; // Reset lives variable
            updateLivesDisplay(); // Reset hearts display
            // Don't automatically call startGame(), let user press the button
        });
    }
}
// --- END OF MODIFIED displayWinPopup ---


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Setting up listeners...");

    // Select elements needed for listeners *after* DOM is ready
    const localStartButton = document.getElementById('start-new-game');
    const localSoundButton = document.getElementById('sound-button');
    const localConfirmButton = document.getElementById('confirm-answer');
    const playButtonIndex = document.getElementById('play-button'); // For index.html

    // Select display elements
    const localTimeDisplay = document.getElementById('time');
    const localScoreDisplay = document.getElementById('score');
    const localQuestionPopup = document.getElementById('question-popup');
    const localLivesContainer = document.getElementById('lives-container'); // Re-select here

    // Log element selection results
    // console.log({localStartButton, localSoundButton, localConfirmButton, playButtonIndex, localTimeDisplay, localScoreDisplay, localQuestionPopup, localLivesContainer});


    // --- Page Specific Logic ---
    if (window.location.pathname.includes('gamePlace.html')) {
        console.log("On gamePlace.html - Initial Setup");

        let initialDifficulty = localStorage.getItem('selectedDifficulty') || 'easy';
        if (!questions.hasOwnProperty(initialDifficulty)) {
            console.warn(`Invalid difficulty '${initialDifficulty}'. Defaulting to easy.`);
            initialDifficulty = 'easy';
            localStorage.setItem('selectedDifficulty', initialDifficulty);
        }

        let initialDuration;
        switch (initialDifficulty) {
            case 'medium':      initialDuration = 150; break;
            case 'hard':        initialDuration = 120; break;
            case 'expert':      initialDuration = 90;  break;
            case 'insane':      initialDuration = 60;  break;
            case 'impossible':  initialDuration = 45;  break;
            default:            initialDuration = 180; break;
        }
        // console.log(`Initial difficulty: ${initialDifficulty}, Initial duration: ${initialDuration}`);

        if (localTimeDisplay) {
            const initialMinutes = Math.floor(initialDuration / 60);
            const initialSeconds = initialDuration % 60;
            const timeString = `${initialMinutes}:${initialSeconds < 10 ? '0' : ''}${initialSeconds}`;
            localTimeDisplay.textContent = timeString;
            timeLeft = initialDuration;
        } else {
            console.error("Time display element (#time) not found!");
        }

        if (localScoreDisplay) {
             localScoreDisplay.textContent = score; // Show initial score (0)
        } else {
             console.error("Score display element (#score) not found!");
        }

        // Initialize lives display
        lives = MAX_LIVES; // Ensure lives are set before display
        updateLivesDisplay(); // Show initial hearts

        if (localQuestionPopup) {
             localQuestionPopup.classList.add('hidden'); // Ensure popup is hidden initially
        } else {
             console.error("Question popup element not found!");
        }

        // Add listeners for game page buttons
        if (localStartButton) {
            localStartButton.addEventListener('click', startGame);
            localStartButton.disabled = false; // Ensure start button is enabled initially
        } else {
            console.error("Start New Game button not found.");
        }
        if (localConfirmButton) {
            localConfirmButton.addEventListener('click', confirmAnswer);
        } else {
             console.error("Confirm Answer button not found.");
        }


    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
         console.log("On index.html or root");
        if (playButtonIndex) {
            playButtonIndex.addEventListener('click', () => {
                window.location.href = 'levels.html';
            });
        } else {
             console.error("Play button (#play-button) not found.");
        }

        // Popup listeners for index.html
        const howToPlayButton = document.getElementById('how-to-play');
        const leaderboardsButton = document.getElementById('leaderboards');
        const soundSettingsButton = document.getElementById('sound-settings');
        const closeHowToPlay = document.getElementById('close-how-to-play');
        const closeLeaderboards = document.getElementById('close-leaderboards-popup');
        const closeSoundPopup = document.getElementById('close-sound-popup');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');

        if (howToPlayButton) howToPlayButton.addEventListener('click', () => document.getElementById('how-to-play-popup')?.classList.remove('hidden'));
        if (leaderboardsButton) leaderboardsButton.addEventListener('click', () => document.getElementById('leaderboards-popup')?.classList.remove('hidden'));
        if (soundSettingsButton) soundSettingsButton.addEventListener('click', () => document.getElementById('sound-popup')?.classList.remove('hidden'));
        if (closeHowToPlay) closeHowToPlay.addEventListener('click', () => document.getElementById('how-to-play-popup')?.classList.add('hidden'));
        if (closeLeaderboards) closeLeaderboards.addEventListener('click', () => document.getElementById('leaderboards-popup')?.classList.add('hidden'));
        if (closeSoundPopup) closeSoundPopup.addEventListener('click', () => document.getElementById('sound-popup')?.classList.add('hidden'));

        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', () => {
                volumeValue.textContent = `Volume: ${volumeSlider.value}%`;
                // Add actual sound volume adjustment logic here if needed
            });
             // Initialize display
             volumeValue.textContent = `Volume: ${volumeSlider.value}%`;
        }
        // console.log("Event listeners for index.html buttons set up."); // Your original log

    } else if (window.location.pathname.includes('levels.html')) {
         console.log("On levels.html");
        const levels = document.querySelectorAll('.level');
        levels.forEach(level => {
            level.addEventListener('click', () => {
                levels.forEach(l => l.classList.remove('selected'));
                level.classList.add('selected');
            });
        });

        const startGameButtonLevels = document.getElementById('start-game-button');
        if (startGameButtonLevels) {
            startGameButtonLevels.addEventListener('click', () => {
                const selectedLevelEl = document.querySelector('.level.selected');
                if (selectedLevelEl) {
                    const level = selectedLevelEl.dataset.level;
                    localStorage.setItem('selectedDifficulty', level);
                    window.location.href = 'gamePlace.html';
                } else {
                    alert('Please select a level!');
                }
            });
        }

        // Popup listeners for levels.html (copied from your index.html logic, adjust if needed)
        const howToPlayButton = document.getElementById('how-to-play');
        const leaderboardsButton = document.getElementById('leaderboards');
        const soundSettingsButton = document.getElementById('sound-settings');
        const closeHowToPlay = document.getElementById('close-how-to-play');
        const closeLeaderboards = document.getElementById('close-leaderboards-popup');
        const closeSoundPopup = document.getElementById('close-sound-popup');

        if (howToPlayButton) howToPlayButton.addEventListener('click', () => document.getElementById('how-to-play-popup')?.classList.remove('hidden'));
        if (leaderboardsButton) leaderboardsButton.addEventListener('click', () => document.getElementById('leaderboards-popup')?.classList.remove('hidden'));
        if (soundSettingsButton) soundSettingsButton.addEventListener('click', () => document.getElementById('sound-popup')?.classList.remove('hidden'));
        if (closeHowToPlay) closeHowToPlay.addEventListener('click', () => document.getElementById('how-to-play-popup')?.classList.add('hidden'));
        if (closeLeaderboards) closeLeaderboards.addEventListener('click', () => document.getElementById('leaderboards-popup')?.classList.add('hidden'));
        if (closeSoundPopup) closeSoundPopup.addEventListener('click', () => document.getElementById('sound-popup')?.classList.add('hidden'));

    }

    // --- Global Elements (like sound button if it exists on multiple pages) ---
    if (localSoundButton) {
        localSoundButton.addEventListener('click', () => {
            alert('Sound toggle clicked! (Functionality not implemented yet)');
        });
    }

    // --- Your original volume slider fix ---
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            volumeValue.textContent = `Volume: ${volume}%`;
        });
        // Initialize display if needed
        // volumeValue.textContent = `Volume: ${volumeSlider.value}%`;
    }
    // console.log("Volume slider functionality set up."); // Your original log

    // --- Your original button sound fix ---
    const buttonSound = document.getElementById('button-sound');
    const buttonsWithSound = document.querySelectorAll('.button-with-sound'); // Make sure buttons have this class
    buttonsWithSound.forEach(button => {
        button.addEventListener('click', () => {
            if (buttonSound) {
                buttonSound.currentTime = 0;
                buttonSound.play();
            }
        });
    });

    console.log("Initial setup complete."); // Log: End of setup
});
