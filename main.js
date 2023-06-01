const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const GAME_STATE = {
  FirstCardAwait: "FirstCardAwait",
  SecondCardAwait: "SecondCardAwait",
  CardMatchFailed: "CardMatchFailed",
  CardsMatched: "CardMatched",
  GameFinished: "GameFinished",
}

//function area - MVC principle + others
const model = {
  revealedCard: [],
  score: 0,
  triedTimes: 0,
  isRevealedCardMatched: function isRevealedCardMatched() {
    return this.revealedCard[0].dataset.index % 13 === this.revealedCard[1].dataset.index % 13
  },
}

const view = {
  getCardElement: function getCardElement(index) {
    return `<div data-index=${index} class="card back"></div >`
  },

  getCardContent: function getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)  ]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },

  transformNumber: function transformNum(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  flipCards: function flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains("back")) {
        card.classList.remove("back")
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      } else {
        card.classList.add("back")
        card.innerHTML = ""
      }
    })
  },

  displayCards: function displayCards() {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join("");
  },

  pairCards: function pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },

  renderScore: function renderScore(score) {
    document.querySelector(".score").textContent = `
  scores:${score} 
  `
  },

  renderTriedTimes: function renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `
  You've tried : ${times} times.
  `
  },

  appendWrongAnimation: function appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener("animationed", event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished: function showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
  <p>Competed!</p>
  <p>Score: ${model.score}</p>
  <p>You've tried : ${model.triedTimes} times.</p>
  `
    const header = document.querySelector("#header")
    header.before(div)
  }

}

const controller = {
  currentState: GAME_STATE.FirstCardAwait,
  generateCards: function generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction: function dispatchCardAction(card) {
    if (!card.classList.contains('card')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwait:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card);
        model.revealedCard.push(card);
        this.currentState = GAME_STATE.SecondCardAwait;
        break
      case GAME_STATE.SecondCardAwait:
        view.flipCards(card)
        model.revealedCard.push(card);
        if (model.isRevealedCardMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCard)
          model.revealedCard = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwait
        } else {
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCard)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log("current state:", this.currentState)
    console.log("current card:", model.revealedCard)
  },
  resetCards: function resetCards() {
    view.flipCards(...model.revealedCard)
    model.revealedCard = []
    controller.currentState = GAME_STATE.FirstCardAwait
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()

document.querySelectorAll(".card").forEach(function addEvent(card) {
  card.addEventListener("click", function clickAction(event) {
    controller.dispatchCardAction(card)
  })
})

