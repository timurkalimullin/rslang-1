import soundStart from '@/assets/sounds/start.mp3';
import soundWin from '@/assets/sounds/win.mp3';
import soundCorr from '@/assets/sounds/correctly.mp3';
import soundGO from '@/assets/sounds/game-over.mp3';
import soundMist from '@/assets/sounds/mistake.mp3';
import SavannahView from './savannahView';
import SavannahModel from './savannahModel';

export default class SavannahController {
  constructor(user, callResult) {
    this.view = new SavannahView();
    this.callResult = callResult;
    this.model = new SavannahModel(user);
    this.level = 0;
    this.maxHeart = 5;
    this.heart = 5;
    this.count = 10;
    this.attempt = 0;
    this.correctly = 0;
    this.sound = true;
    this.answer = false;
  }

  init() {
    this.view.renderHTML();
    this.createEvent();
  }

  createEvent() {
    this.view.options.addEventListener('click', this.getAnswer.bind(this));
    document.getElementById('selectLang').addEventListener('change', (e) => {
      this.model.lang = e.target.value;
      this.view.lang = e.target.value;
    });
    document.getElementById('selectHearts').addEventListener('change', (e) => {
      const MIN_HEARTS = 3;
      const options = ['hard', 'normal', 'easy'];
      this.maxHeart = MIN_HEARTS + options.findIndex((item) => item === e.target.value);
      this.model.maxHeart = this.maxHeart;
      this.view.countHearts = this.maxHeart;
      this.view.createHearts();
    });
    document.getElementById('selectSpeed').addEventListener('change', (e) => {
      const MAX_SPEED = 7;
      const options = ['easy', 'normal', 'hard'];
      this.view.speed = MAX_SPEED - 2 * options.findIndex((item) => item === e.target.value);
    });
    document.getElementById('cancel').addEventListener('click', () => {
      this.sound = false;
      document.getElementById('main').className = 'main';
      document.getElementById('navPage').click();
    });
    const sound = document.getElementById('sound');
    sound.addEventListener('click', () => {
      this.sound = !this.sound;
      sound.classList.toggle('sound-mute');
    });
    document.getElementById('closePopup').addEventListener('click', () => {
      document.getElementById('main').className = 'main';
      document.getElementById('navPage').click();
    });
    document.getElementById('startGame').addEventListener('click', this.getStart.bind(this));
    document.body.addEventListener('keydown', (e) => {
      if (e.code.includes('Digit')) {
        const id = +e.code.replace('Digit', '');
        if (id > 0 && id < 5) {
          document.getElementById(`savAnswer${id}`).click();
        }
      }
    });
  }

  async getStart() {
    this.getAudio('start');
    this.view.getStart();
    this.model.countWords = this.count;
    this.model.level = this.level;
    this.model.createWords();
    setTimeout(this.getStartRound.bind(this), 3000);
    await this.model.getWords();
  }

  getStartRound() {
    this.view.getStartRound();
    this.attempt = 0;
    this.correctly = 0;
    this.heart = this.maxHeart;
    // this.addStatistics();
    this.startNextRound();
  }

  startNextRound() {
    this.view.startNextRound(this.model.gameWords, this.attempt, this.model.words);
    const countHeart = this.maxHeart - this.heart;
    if (this.view.top.classList.length > 0) {
      this.view.top.addEventListener('animationend', () => {
        this.lockChoise = false;
        this.view.setAnswer();
        this.view.top.addEventListener('animationstart', () => this.getAudio('mistake'));
        this.view.nextWord(countHeart, this.answer);
        this.view.top.addEventListener('animationend', this.nextWord.bind(this, this.attempt));
      });
    } else {
      this.view.bottom.addEventListener('animationend', () => {
        this.lockChoise = false;
        this.view.setAnswer();
        this.view.bottom.addEventListener('animationstart', () => this.getAudio('mistake'));
        this.view.nextWord(countHeart, this.answer);
        this.view.bottom.addEventListener('animationend', this.nextWord.bind(this, this.attempt));
      });
    }
    this.answer = false;
  }

  getAnswer({ target }) {
    if (target.tagName === 'BUTTON' && target.classList.length < 2) {
      this.answer = true;
      if (target.dataset.answer === 'true') {
        this.view.setAnswer('correct', target);
        this.getAudio('correctly');
        this.correctly += 1;
        const delta = (this.correctly / this.count);
        this.view.getCorrectlyAnswer(target, delta);
        this.model.words[this.attempt].success = true;
      } else {
        this.view.setAnswer('mistake', target);
        this.getAudio('mistake');
        const countHeart = this.maxHeart - this.heart;
        this.view.getIncorrectlyAnswer(target, countHeart);
        this.model.words[this.attempt].success = false;
        this.heart -= 1;
        // this.changeWordStatistics();
      }
      this.attempt += 1;
      // this.changeStatistics();
      this.view.top.addEventListener('animationend', this.checkEndGame.bind(this));
      this.view.bottom.addEventListener('animationend', this.checkEndGame.bind(this));
    }
  }

  nextWord() {
    this.model.words[this.attempt].correctly = false;
    this.heart -= 1;
    this.attempt += 1;
    this.checkEndGame();
  }

  checkEndGame() {
    if (this.correctly === this.count || this.heart === 0) {
      if (this.heart === 0) {
        this.getAudio('game-over');
      } else {
        this.getAudio('win');
      }
      if (this.view.top) this.view.top.remove();
      if (this.view.bottom) this.view.bottom.remove();
      setTimeout(() => {
        this.view.endGame();
        this.callResult(this.model.words.slice(0, this.attempt));
      }, 4000);
    } else {
      this.view.bottom.remove();
      this.view.top.remove();
      this.startNextRound();
    }
  }

  change() {
    this.model.newGame();
    this.view.newGame();
  }

  getCountWords() {
    return this.model.countWords;
  }

  changeCountWords(value) {
    this.count = +value;
  }

  getScore() {
    let count = 0;
    for (let i = 0; i < this.attempt; i += 1) {
      if (this.model.words[i].success) {
        count += 1;
      }
    }
    return count;
  }

  getAudio(stateGame) {
    if (this.sound) {
      const audio = new Audio();
      switch (stateGame) {
        case 'start':
          audio.src = soundStart;
          break;
        case 'win':
          audio.src = soundWin;
          break;
        case 'correctly':
          audio.src = soundCorr;
          break;
        case 'mistake':
          audio.src = soundMist;
          break;
        case 'game-over':
          audio.src = soundGO;
          break;
        default:
          break;
      }
      audio.autoplay = true;
    }
  }
}
