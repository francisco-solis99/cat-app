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
      upload: '/images/upload'
    }
    this.randomSection = document.querySelector('.random');
    this.uploadSection = document.querySelector('.upload');
    this.favoritesSection = document.querySelector('.favorites');
  }

  init(){
    // render the initial random kitties at the beginning
    this.renderRandomKitties(4);
    // render the favorite kitties at the beginning
    this.renderFavoriteKitties();

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
    uploadBtn.addEventListener('click', () => this.handlerUploadImage());
  }

  // main functions

  // RANDOM KITTIES
  async renderRandomKitties(numKitties = 1) {
    const div = document.createElement('div');
    div.classList.add('random__kitties-container');
    const kitties = await this.loadRandomKitties(numKitties);
    kitties.forEach(async (kitty) => {
      const kittyElement = await this.renderKitty(kitty);
      div.appendChild(kittyElement);
    });
    this.randomSection.appendChild(div);
  }

  async renderKitty(kitty, isFavorite = false) {
    const figure = document.createElement('figure');
    figure.classList.add('kitty__wrapper');
    const img = document.createElement('img');
    img.alt = 'Kitty Image';
    img.loading = 'lazy';
    img.classList.add('kitty__img');
    const div = document.createElement('div');
    div.classList.add('kitty__like-container');
    const likeBtn = document.createElement('div');
    likeBtn.classList.add('kitty__like-button');

    if(isFavorite) {
      figure.dataset.id = kitty.image.id;
      img.src = kitty.image.url;
      likeBtn.classList.add('liked');
      // Add listener to remove favorite kitties
      likeBtn.addEventListener('click', (e) => this.deleteFavoriteKitties(e, kitty), { once: true });
    } else {
      figure.dataset.id = kitty.id;
      img.src = kitty.url;
      // Add listener to add favorite kitties
      likeBtn.addEventListener('click', (e) => {
        e.target.classList.add('liked');
        this.addFavoriteKitties(kitty), { once: true };
      });
    }

    div.appendChild(likeBtn);
    figure.appendChild(img);
    figure.appendChild(div);
    return figure;
  }

  async loadRandomKitties(numKitties) {
    try {
      const randomUrl = `${this.#API.baseUrl}${this.#API.random}?limit=${numKitties}`;
      const response = await fetch(randomUrl);
      const kitties = await response.json();
      return kitties;
    } catch (error) {
      console.log(error);
    }
  }

  // FAVORITE KITTIES
  async addFavoriteKitties(kitty){
    try {
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
      // if the response is ok, then render the kitty
      if(response.ok) {
        const {id: favoriteId} = await response.json();
        const responseFavorite = await this.loadFavoriteKitties(favoriteId);
        const favoriteKittyElement = await this.renderKitty(responseFavorite, true);
        const favoritesContainer =  this.favoritesSection.querySelector('.favorite__kitties-container');
        favoritesContainer.appendChild(favoriteKittyElement);
      }

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong, please try again later',
        subtitle: error.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  async deleteFavoriteKitties(e, kitty) {
    try {
      e.target.classList.remove('liked');
      const deleteUrl = `${this.#API.baseUrl}${this.#API.favorites}/${kitty.id}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': this.#API.apiKey,
        }
      });
      // delete the kitty from the DOM
      const kittyElement = this.favoritesSection.querySelector(`figure[data-id="${kitty.image.id}"]`);
      kittyElement.remove();

    } catch (error) {
      console.log(error);
    }
  }

  async loadFavoriteKitties(specificKittyId) {
    try {

      const specificKittyPartUrl = `${specificKittyId === undefined ? '' : `/${specificKittyId}`}`;
      const favoritesUrl = `${this.#API.baseUrl}${this.#API.favorites}${specificKittyPartUrl}`;
      const response = await fetch(favoritesUrl, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.#API.apiKey,
        },
      });
      const kitties = await response.json();
      return kitties;
    } catch (error) {
      console.log(error);
    }
  }

  async renderFavoriteKitties() {
    try {
      const div = document.createElement('div');
      div.classList.add('favorite__kitties-container');
      const kitties = await this.loadFavoriteKitties();
      console.log(kitties);
      kitties.forEach(async (kitty) => {
        const kittyElement = await this.renderKitty(kitty, true);
        div.appendChild(kittyElement);
      });
      this.favoritesSection.appendChild(div);
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

  async handlerUploadImage(){
    try {
      const form = this.uploadSection.querySelector('.upload__form');
      const formData = new FormData(form);
      const {name: fileName, size: fileSize} = formData.get('file');
      if(fileName === '' || fileSize === 0) {
        throw new Error('No file selected');
      }
      const uploadURL = `${this.#API.baseUrl}${this.#API.upload}`;
      const response = await fetch(uploadURL, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.#API.apiKey,
        },
        body: formData,
      });
      const kittyResponse = await response.json();
      this.addFavoriteKitties(kittyResponse);

    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
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
