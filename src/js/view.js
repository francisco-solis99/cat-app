export default class KittieView {
  #API;
  constructor() {
    this.#API = {
      baseUrl: 'https://api.thecatapi.com/v1',
      apiKey: '6475bd37-29d5-4525-a122-126fa916ea01',
      random: '/images/search',
      favorites: '/favourites',
    }
    this.randomSection = document.querySelector('.random');
    this.uploadSection = document.querySelector('.upload');
    this.favoritesSection = document.querySelector('.favorites');
  }

  init(){
    this.renderRandomKitties(4);
    const form = this.randomSection.querySelector('.random__form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const numKitties = Number(e.target.querySelector('.random__input').value);
      this.randomSection.removeChild(this.randomSection.lastChild);
      console.log(numKitties);
      this.renderRandomKitties(numKitties);
    })
  }

  async renderRandomKitties(numKitties = 1) {
    const div = document.createElement('div');
    div.classList.add('random__kitties-container');
    const kitties = await this.loadRandomKitties(numKitties);
    kitties.forEach(async (kitty) => {
      const kittyElement = await this.renderRandomKitty(kitty);
      div.appendChild(kittyElement);
    });
    this.randomSection.appendChild(div);
  }

  async renderRandomKitty(kitty){
    const figure = document.createElement('figure');
    figure.classList.add('random__kitty-wrapper');
    const img = document.createElement('img');
    img.src = kitty.url;
    img.alt = 'Kitty Image';
    img.loading = 'lazy';
    img.classList.add('random__kitty-img');
    figure.appendChild(img);
    return figure;
  }

  async loadRandomKitties(numKitties) {
    const randomUrl = `${this.#API.baseUrl}${this.#API.random}?limit=${numKitties}`;
    const reponse = await fetch(randomUrl);
    const kitties = await reponse.json();
    return kitties;
  }
}
