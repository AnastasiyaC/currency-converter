const curencies = ['BYN', 'USD', 'EUR', 'CNY', 'RUB'];

const API_BASE = 'https://v6.exchangerate-api.com/v6/';
const API_KEY = '39e27a1a9001cc932c683639';

//elements variables
const converterForm = document.forms.converter;
const amountMistake = document.querySelector('.form__prompt--mistake_amount');
const buttonToShowDatePicker = document.querySelector('.description__button');
const converterDescription = document.querySelector('.description');
const dateText = document.querySelector('.description__text');

//results variables
const exchangeResultOne = document.querySelector('.exchange-results__result-first');
const exchangeResultTwo = document.querySelector('.exchange-results__result-second');
const exchangeRatetOne = document.querySelector('.exchange-rates__rate-first');
const exchangeRatetTwo = document.querySelector('.exchange-rates__rate-second');

const currentRates = {
    currentRate: null,
    currentDate: null,
}

const createOption = (name) => `<option value="${name}">${name}</option>`;
const addZero = (num) => ((num < 10) ? '0' : '') + num;

function addOptionsFrom(arr) {
    const inner = arr.map( (el) => {
        return createOption(el);
    });
    converterForm.from.innerHTML = inner.join(' ');
    updateOptionsTo(converterForm.from.value, arr);
};

function updateOptionsTo(value, arr) {
    const inner = arr.map( (el) => {
        if ( el === value) return;
        else {
            return createOption(el);
        }   
    });
    converterForm.to.innerHTML = inner.join(' ');
};

function setDatePickerValue() {
    const dateToday = new Date();
    const dateFormat = `${dateToday.getFullYear()}-${addZero(dateToday.getMonth() + 1)}-${addZero(dateToday.getDate())}`;

    converterForm.date.value = dateFormat;
    converterForm.date.max = dateFormat;
    currentRates.currentDate = converterForm.date.value;
};

function getCurrency(from, to) {
    fetch(`${API_BASE}${API_KEY}/pair/${from}/${to}`)
    .then(response => response.json())
    .then( (value) => {
        const conversionRate = value.conversion_rate;
        currentRates.currentRate = conversionRate;
        makeConvertion(converterForm.date.value, conversionRate, from, to);
    })
    .catch( (err) => {
        console.log(err.message);
        prompt('something went wrong', err.message);
        removeClass(converterForm, 'form--loading');
    });
};

function makeConvertion(date, exchangeValue, from, to) {
    if (date === currentRates.currentDate) {
        showCurrencyExchange(exchangeValue, from, to);
    }
    else {
        const genereatedValue = generateNewCurrencyRate(exchangeValue);
        showCurrencyExchange(genereatedValue, from, to); 
    }
    removeClass(converterForm, 'form--loading');
    addClass(converterForm, 'form--showing');
};

function showCurrencyExchange(rate, a, b) {
    exchangeResultOne.textContent = `${converterForm.amount.value} ${a} =`;
    exchangeResultTwo.textContent = `${(converterForm.amount.value * rate).toFixed(2)} ${b}`;

    exchangeRatetOne.textContent = `1 ${a} = ${Number(rate).toFixed(2)} ${b}`;
    exchangeRatetTwo.textContent = `1 ${b} = ${(1 / rate).toFixed(2)} ${a}`;
};

function generateNewCurrencyRate(currencyRate) {
    const min = currencyRate * 0.9;
    const max = currencyRate * 1.1;
    return (Math.random() * (max - min) + min).toFixed(4);
};

function checkFutureDate() {
    const dateToday = new Date();
    const selectedDay = new Date(converterForm.date.valueAsNumber);

    return dateToday <= selectedDay;
};

function showCheckedDate(date) {
    const futureDayChecked = checkFutureDate();

    if (date === currentRates.currentDate ) {
        dateText.textContent = `The currency convertsion corresponds to current exchange rates.`;
    }
    if (futureDayChecked) {
        dateText.textContent = `The currency convertsion corresponds to current exchange rates.`;
        converterForm.date.value = currentRates.currentDate;
    }
    else {
        const checkDate = new Date(converterForm.date.valueAsNumber);
        const year = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dateFormat = `${checkDate.getDate()}th of ${year[checkDate.getMonth()]} ${checkDate.getFullYear()}`;

        dateText.textContent = `The currency convertsion corresponds to ${dateFormat} exchange rates.`;
    }
};

function showAmountMistake(value) {
    if (value) {
        amountMistake.textContent = 'Amount shoul be a possitive number';
    }
    if (!value) {
        amountMistake.textContent = Number(converterForm.amount.value) === 0 ? 'Amount should be a number' : 'Enter amount';
    }
    removeClass(converterForm, 'form--showing');
    addClass(converterForm, 'form--mistake_amount');
};

function showDateMistake() {
    const futureDayChecked = checkFutureDate();

    if (futureDayChecked) {
        console.log('+')
        addClass(converterForm, 'form--mistake_date');
    }  
    if (!futureDayChecked) {
        removeClass(converterForm, 'form--mistake_date');
    }
};

function addClass(element, className) {
    if (element.classList.contains(className)) {
        return;
    } 
    else {
        element.classList.add(className);
    } 
};

function removeClass(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
};

//events
converterForm.addEventListener('click', (event) => {
    event.preventDefault;

    if (event.target === converterForm.amount) {
        removeClass(converterForm, 'form--mistake_amount');
    }
    if (event.target.classList.contains('input-button')) {
        if (!converterForm.amount.value || converterForm.amount.value <= 0) {
            showAmountMistake(converterForm.amount.value);
        }
        else {
            addClass(converterForm, 'form--loading');
            getCurrency(converterForm.from.value, converterForm.to.value);
        }
    }
    if (event.target === buttonToShowDatePicker) {
        addClass(converterDescription, 'description--active');
        buttonToShowDatePicker.disabled = true;
        converterForm.date.focus();
    }
});

converterForm.addEventListener('change', (event) => {
    if( event.target === converterForm.from ) {
        updateOptionsTo(event.target.value, curencies);
    }
    if (event.target === converterForm.date) {
        showDateMistake();
    }
});

converterForm.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
      event.target.blur();
    }
});

converterForm.date.addEventListener('blur', () => {
    if (converterForm.classList.contains('form--showing')) {
        converterForm.classList.add('form--loading');
        getCurrency(converterForm.from.value, converterForm.to.value);
    }
    removeClass(converterForm, 'form--mistake_date');
    removeClass(converterDescription, 'description--active');
    buttonToShowDatePicker.disabled = false;
    showCheckedDate(converterForm.date.value); 
});

addOptionsFrom(curencies);
setDatePickerValue();