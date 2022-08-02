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

    // => add listeners for random section
    const form = selectHtmlElement(this.randomSection, '.random__form');
    form.addEventListener('submit', (e) => this.handlerSubmitRandom(e));

    // => add listeners for upload section
    const inputFile = selectHtmlElement(this.uploadSection, '.upload__file');
    const selectFileBtn = selectHtmlElement(this.uploadSection, '.select__button');
    const dropArea = selectHtmlElement(this.uploadSection, '.upload__zone');
    //file listeners
    selectFileBtn.addEventListener('click', () => inputFile.click());
    inputFile.addEventListener('change', (e) => this.handlerPreviewImage(e));
    // drag and drop listeners
    dropArea.addEventListener('dragover', (e) => e.preventDefault());
    dropArea.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    dropArea.addEventListener('dragend', (e) => this.handleLeave(e));
    dropArea.addEventListener('dragexit', (e) => this.handleLeave(e));
    dropArea.addEventListener('dragleave', (e) => this.handleLeave(e));
    dropArea.addEventListener('drop', (e) => this.handleDrop(e, inputFile));
    // upload the image listener
    const uploadBtn = selectHtmlElement(this.uploadSection, '.upload__button');

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
    const div = document.createElement('div');
    div.classList.add('random__like-container');
    const likeBtn = document.createElement('div');
    likeBtn.classList.add('random__like-button');
    // Add listener of load to favorites
    likeBtn.addEventListener('click', (e) => this.loadFavoriteKitties(e, kitty), { once: true });
    div.appendChild(likeBtn);
    figure.appendChild(img);
    figure.appendChild(div);
    return figure;
  }

  async loadRandomKitties(numKitties) {
    try {
      const randomUrl = `${this.#API.baseUrl}${this.#API.random}?limit=${numKitties}`;
      const reponse = await fetch(randomUrl);
      const kitties = await reponse.json();
      return kitties;
    } catch (error) {
      console.log(error);
    }

  }

  async loadFavoriteKitties(e,kitty){
    try {
      e.target.classList.add('liked');
      const favoritesUrl = `${this.#API.baseUrl}${this.#API.favorites}`;
      const response = await fetch(favoritesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.#API.apiKey,
        },
        body: JSON.stringify({
          image_id: kitty.id
        }),
      });
    } catch (error) {
      console.log(error);
    }
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
      text: 'The image type has to be .jpg or .png and remember it has to be a cat',
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }

  handleDragEnter(e) {
    e.target.classList.add('active');
  }

  handleLeave(e){
    e.preventDefault();
    e.target.classList.remove('active');
  }

  handleDrop(e, inputFile){
    e.preventDefault();
    e.target.classList.remove('active');

    // get the file and fire the change event to preview the image
    const files = e.dataTransfer.files;
    inputFile.files = files;
    inputFile.dispatchEvent(new Event('change'));
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
