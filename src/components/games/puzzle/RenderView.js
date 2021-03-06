import { createElement } from '@/utils';
import { modifySentence, shuffleSentence } from './RoundData/modifySentence';
import volumeImg from '../../../assets/img/volume.svg';
import soundTip from '../../../assets/img/puzzle/speaker.svg';
import backTip from '../../../assets/img/puzzle/photo.svg';
import textTip from '../../../assets/img/puzzle/text.svg';
import playTip from '../../../assets/img/puzzle/sound.svg';

export default class RenderView {
  constructor(root, data, containerWidth, containerHeight) {
    this.root = root;
    this.data = data;
    this.row = null;
    this.containerHeight = containerHeight;
    this.containerWidth = containerWidth;
    this.rowHeight = containerHeight / 10; /*  10 - sentences number */
    this.puzzleContainer = null;
    this.wordContainer = null;
    this.sentenceTranslation = null;
  }

  displayElement(nodeSelector, display) {
    this.root.querySelector(nodeSelector).style.display = display;
  }

  modifyData() {
    let offsetY = 0;
    Object.values(this.data.sentences).forEach((el) => {
      const modified = modifySentence(el.textExample, this.containerWidth, this.rowHeight);
      Object.values(modified).forEach((word) => {
        const currentWord = word;
        currentWord.offsetY = offsetY;
      });
      const shuffled = shuffleSentence(modified);
      const currentEl = el;
      currentEl.splitted = modified;
      currentEl.shuffled = shuffled;
      offsetY += this.rowHeight;
    });
  }

  renderMainLayout() {
    this.root.innerHTML = `
      <div class="container">
        <div class="control-block">
        <a class="btn btn__exit" href="#/games">Выход</a>
        <div class="btn__block">
          <button class="btn btn__icon btn__backImg"><img src=${backTip} class="tip"><span class="tooltiptext">Кликай для включения / выключения фона паззлов в следующем ряду</span></button>
          <button class="btn btn__icon btn__audio__tip"><img src=${soundTip} class="tip"><span class="tooltiptext">Кликай для включения / выключения аудиоподсказки в следующем ряду</span></button>
          <button class="btn btn__icon btn__translate"><img src=${textTip} class="tip"><span class="tooltiptext">Кликай для включения / выключения перевода предложения в следующем ряду</span></button>
          <select class="btn select-level">
            <option value="0">Уровень 1</option>
            <option value="1">Уровень 2</option>
            <option value="2">Уровень 3</option>
            <option value="3">Уровень 4</option>
            <option value="4">Уровень 5</option>
            <option value="5">Уровень 6</option>
          </select>
          <select class="btn select-round"></select>
          <button class="btn btn__select">Выбрать раунд</button>
          <button class="btn btn__userwords">Слова пользователя</button>
          <button class="btn btn__statistics">Статистика</button>
        </div>
        <div class="btn__audio__wrapper"><button class="btn btn__icon btn__audio"><img src=${playTip} class="tip"><span class="tooltiptext">Кликай для воспроизведения аудиоподсказки текущего предложения</span></button></div>
        <div class="sentence-translation"></div>
        </div>
        <div class="puzzle-container"></div>
        <div class="word-container"></div>
        <div class="control-block">
          <div class="btn__block btn__block_bottom">
            <button class="btn btn__check">Проверить</button>
            <button class="btn btn__continue">Продолжить</button>
            <button class="btn btn__idk">Я не знаю</button>
          </div>
        </div>
      </div>
    `;

    let maxroundNumber = 25;
    while (maxroundNumber) {
      const option = document.createElement('option');
      option.setAttribute('value', maxroundNumber);
      option.innerText = `Раунд ${maxroundNumber}`;
      this.root.querySelector('.select-round').append(option);
      maxroundNumber -= 1;
    }

    this.puzzleContainer = this.root.querySelector('.puzzle-container');
    this.wordContainer = this.root.querySelector('.word-container');
    this.sentenceTranslation = this.root.querySelector('.sentence-translation');
    this.wordContainer.style.width = `${this.containerWidth + 100}px`;
    this.wordContainer.style.height = `${this.rowHeight + 20}px`;
    this.puzzleContainer.style.width = `${this.containerWidth}px`;
    this.puzzleContainer.style.height = `${this.containerHeight}px`;

    this.markElements();
  }

  markElements() {
    if (this.data.isUserWords) {
      this.root.querySelector('.btn__userwords').classList.add('chosen');
    }

    this.root.querySelector('.select-round').querySelectorAll('option').forEach((el) => {
      if (parseInt(el.value, 0) === this.data.roundNumber) {
        el.setAttribute('selected', 'true');
      }
    });

    this.root.querySelector('.select-level').querySelectorAll('option').forEach((el) => {
      if (parseInt(el.value, 0) === this.data.level) {
        el.setAttribute('selected', 'true');
      }
    });

    if (!this.data.tips.backImg) {
      this.root.querySelector('.btn__backImg').classList.add('inactive');
    }

    if (!this.data.tips.translate) {
      this.root.querySelector('.btn__translate').classList.add('inactive');
    }

    if (!this.data.tips.autoPlay) {
      this.root.querySelector('.btn__audio__tip').classList.add('inactive');
      this.root.querySelector('.btn__audio').style.display = 'none';
    }
  }

  renderRow() {
    this.row = document.createElement('div');
    this.row.classList.add('row');
    this.row.style.height = `${this.rowHeight}px`;
    this.row.style.outline = '2px dotted gray';

    return this.row;
  }

  renderWord(wordData) {
    this.word = document.createElement('div');
    this.word.classList.add('word', 'draggable');
    this.word.innerHTML = `<span>${wordData.word}</span>`;
    this.word.style.width = `${wordData.width}px`;
    this.word.style.height = `${this.rowHeight}px`;
    this.word.style.background = `url(${this.data.cutRoundImg}) no-repeat`;
    this.word.style.backgroundPosition = `-${wordData.offsetX}px -${wordData.offsetY}px`;
    this.word.style.backgroundSize = `${this.containerWidth}px ${this.containerHeight}px`;
    return this.word;
  }

  renderResult(sentenceData, fails) {
    this.resultWindow = document.createElement('div');
    this.resultWindow.classList.add('result-window');
    this.resultWindow.innerHTML = `
      <div class="result-modal">
        <div class="result-modal__painting">
          <img class="result-modal__image" src=${sentenceData.roundImg} alt="round-image">
          <p class="result-modal__title">${sentenceData.roundImgData.author}, ${sentenceData.roundImgData.name} (${sentenceData.roundImgData.year}) </p>
        </div>
        <div class="result-modal__info">
          <h2>Я не знаю- ${fails}</h2>
          <div class="dont-know"></div>
          <h2>Я знаю - ${10 - fails}</h2>
          <div class="know"></div>
        </div>
        <div class="result-modal__btn">
          <button class="btn btn__continue__modal">Продолжить</button>
          <button class="btn btn__statistics">Статистика</button>
        </div>
      </div>
    `;
    Object.values(sentenceData.sentences).forEach((el) => {
      const resultSentence = document.createElement('div');
      resultSentence.classList.add('result-sentence');
      resultSentence.innerHTML = `
      <img src=${volumeImg} alt="sound">
      <p>${el.textExample}</p>
      `;
      resultSentence.addEventListener('click', () => {
        const audio = new Audio(`${el.audio}`);
        audio.play();
      });
      if (el.success === true) {
        this.resultWindow.querySelector('.dont-know').append(resultSentence);
      } else {
        this.resultWindow.querySelector('.know').append(resultSentence);
      }
    });
    return this.resultWindow;
  }

  renderStats(data) {
    this.statWindow = document.createElement('div');
    this.statWindow.classList.add('stat-window', 'modal-window');

    this.statWindow.innerHTML = `
      <div class="stat-modal">
        <h2 class="stat-modal__title">СТАТИСТИКА</h2>
        <h3>Кликай для продолжения</h3>
      </div>
    `;
    if (!this.root.querySelector('.stat-window')) {
      this.root.append(this.statWindow);
    }

    this.statMessage = this.statWindow.querySelector('.stat-modal');

    Object.keys(data).forEach((key) => {
      if (key !== 'length') {
        const statLine = document.createElement('div');
        statLine.classList.add('stat-line');
        const parsedStat = data[key].replace(' ', '').split(',');
        statLine.innerText = `${new Date(parseInt(key, 0)).toLocaleString()} Правильные ответы: ${parsedStat[0]}, Неправильные ответы: ${parsedStat[1]}`;
        this.statMessage.append(statLine);
      }
    });
  }

  removeModal() {
    this.root.querySelector('.modal-window').remove();
  }

  renderPreloader() {
    this.preloader = createElement({ tag: 'div', class: 'loading' });
    this.preloader.innerHTML = `
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    `;
    this.root.append(this.preloader);
  }

  appendtranslation(translation) {
    this.sentenceTranslation.innerHTML = translation;
  }

  showError(error) {
    const msg = document.createElement('div');
    msg.classList.add('msg');
    msg.innerText = error;
    this.root.append(msg);
  }

  init() {
    this.modifyData();
    this.renderMainLayout();
  }
}
