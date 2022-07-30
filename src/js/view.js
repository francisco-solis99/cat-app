// ES6 Modules or TypeScript
import Swal from 'sweetalert2'


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
    // render the initial random kitties at the beginning
    this.renderRandomKitties(4);
    // util for select a HTML element
    const selectHtmlElement = (parent, query) => parent.querySelector(query) ?? null;

    // add listeners for random section
    const form = selectHtmlElement(this.randomSection, '.random__form');
    form.addEventListener('submit', (e) => this.handlerSubmitRandom(e));

    // add listeners for upload section
    const inputFile = selectHtmlElement(this.uploadSection, '.upload__file');
    const selectFileBtn = selectHtmlElement(this.uploadSection, '.select__button');
    selectFileBtn.addEventListener('click', () => inputFile.click());

    inputFile.addEventListener('change', (e) => this.handlerPreviewImage(e));
  }

  // main functions
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


  // handlers for random section
  handlerSubmitRandom(e){
    e.preventDefault();
    const numKitties = Number(e.target.querySelector('.random__input').value);
    if(numKitties > 0) {
      this.randomSection.removeChild(this.randomSection.lastChild);
      this.renderRandomKitties(numKitties);
      return;
    }
    // send a error with modal
    Swal.fire({
      title: 'Error!',
      text: 'You need to load at least 1 random cat',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }

  handlerPreviewImage(e) {
    const file = e.target.files[0]; //get the first file (not multiple attribute in file input)
    if(this.validFileType(file)) {
      const imgPreview = this.uploadSection.querySelector('.upload__img');
      const urlImage = URL.createObjectURL(file);
      imgPreview.classList.add('loaded');
      imgPreview.src = urlImage;
      return;
    }
    // send a error with modal
    Swal.fire({
      title: 'Error!',
      text: 'The image type has to be .jpg or .png and also teh image has to be a cat',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }


  // utils functions
  validFileType(file) {
    const fileTypes = [
      "image/jpeg",
      "image/png",
      ];
    return fileTypes.includes(file.type);
  }
}
