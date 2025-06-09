const restaurants = [
  {
    id: 30,
    name: "China restaurant Husnes",
    image: "./icons/mainImage.png",
    url: "https://chinarestauranthusnes.klikkogspis.no",
    description: `
	<p>China Restaurant Husnes ønsker gamle og nye gjester velkomne til en trivelig måltid.</p>
    <p>China Restaurant Husnes serverer et bred variasjon av spennende retter fra den kinesiske mat kulturen, i Kina er det en helt klar sammenheng mellom det å spise og det å føle seg lykkelig. Få steder kan måle seg med Kina når det gjelder en lang og rik matkultur, og i få kulturer blir vel mat så høyt elsket og gitt en så sentral funksjon i det daglige liv. Matgleden som er en så viktig del av kinesisk kultur, er det vi ønsker å formidle.</p>
    <p>Vi byr på en meny med hovedvekt på WOKKING.</p>
    <p>Når grønnsakene wokes raskt på høy varme, forsegles overflaten, og både smak, konsistens, farge og næring. Wokking av mat er både sunt og enkel, og hos oss blir alle råvarene riktig behandlet så du kan får i deg akkurat den riktig mengde av sunnhet som du trenger.</p>
    <p>TAKK FOR BESØKET OG VELKOMNE IGJEN</p>`,
    address: "Sentrumsvegen 15, 5460 Husnes",
    openingHours: `<span>Mandag-Tirdag: Stengt</span><span>Onsdag-Søndag: 14:00-22:00</span>`,
  },
  {
    id: 30,
    name: "Demo restaurant",
    image: "./icons/demoLogo.jpg",
    url: "https://demo.klikkogspis.no",
    description: `
	<p>En demonstrasjonsrestaurant.</p>`,
    address: "Matveien 21, 5460 Husnes",
    openingHours: `<span>Mandag-Søndag: 18:00-22:00</span>`,
  },
];

export const restaurantPageHandler = {
  init() {
    this.mainContainer = document.getElementById("main-restaurants-page");
    this.mainContainer.innerHTML = "";
    restaurants.forEach(
      ({ id, name, image, url, description, address, openingHours }) => {
        const container = document.createElement("div");
        container.classList = "flex-column align container";
        container.innerHTML = `
        <a class="flex-column align" href="${url}">
            <div class="image-container">
                <image src="${image}" alt="restaurant image">
            </div>
            <h4>${name}</h4>
            ${address}
            ${openingHours}
        </a>
        <div class="description">${description}
            <div class="blur"></div>
        </div>`;
        const descriptionContainer = container.querySelector(".description");

        descriptionContainer.dataset.closed = "true";

        descriptionContainer.addEventListener("click", () => {
          if (descriptionContainer.dataset.closed == "true") {
            descriptionContainer.dataset.closed = "false";
          } else {
            descriptionContainer.dataset.closed = "true";
          }
        });

        this.mainContainer.appendChild(container);
        setTimeout(() => {
          if (
            descriptionContainer.scrollHeight >
            descriptionContainer.clientHeight
          ) {
            descriptionContainer.dataset.closed = "true";
            descriptionContainer.classList.add("needs-blur");
          }
        }, 0);
      }
    );
  },
};
