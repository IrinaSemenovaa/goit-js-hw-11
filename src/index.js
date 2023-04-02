import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const searchBtnEl = document.querySelector('.search-btn');
const galleryEl = document.querySelector('.gallery');
const searchInputEl = document.querySelector('input[type=text]');

searchBtnEl.addEventListener('click', performSearch);
window.addEventListener('scroll', handleScroll);

const lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;
let currentQuery = '';

async function performSearch(e) {
  e.preventDefault();

  if (currentQuery !== searchInputEl.value.trim()) {
    currentPage = 1;
  }
  currentQuery = searchInputEl.value.trim();

  try {
    const photoCardsData = await searchPhotos(currentQuery, currentPage);

    if (!photoCardsData || photoCardsData.length === 0) {
      showNoResultsError();
      clearGallery();
      return;
    }

    addPhotoCardsToGallery(photoCardsData);
  } catch (error) {
    showNoResultsError();
  }
}

async function searchPhotos(query) {
  const API_KEY = '34888722-f58ec8283d88d561d63a22054';
  const PER_PAGE = 40;
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${PER_PAGE}`;

  try {
    const response = await axios.get(URL);
    const photoCardsData = response.data.hits;
    const totalHits = response.data.totalHits;

    if (!photoCardsData || photoCardsData.length === 0) {
      throw new Error('No results found');
    }
    return { hits: photoCardsData, totalHits };
  } catch (error) {
    throw new Error(error);
  }
}

function addPhotoCardsToGallery(photoCardsData) {
  const photoCardsMarkup = photoCardsData.hits
    .map(
      photo => `
    <div class="photo-card">
      <a href="${photo.largeImageURL}">
        <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${photo.likes}</p>
        <p class="info-item"><b>Views:</b> ${photo.views}</p>
        <p class="info-item"><b>Comments:</b> ${photo.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${photo.downloads}</p>
      </div>
    </div>
  `
    )
    .join('');

  if (currentPage === 1) {
    galleryEl.innerHTML = photoCardsMarkup;
  } else {
    galleryEl.insertAdjacentHTML('beforeend', photoCardsMarkup);
  }

  lightbox.refresh();
}

async function handleScroll() {
  try {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      currentPage += 1;
      const photoCardsData = await searchPhotos(currentQuery, currentPage);
      addPhotoCardsToGallery(photoCardsData);
    }
  } catch (error) {
    showNoResultsError();
  }
}

function clearGallery() {
  galleryEl.innerHTML = '';
}

function showNoResultsError() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}
