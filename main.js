initialDataRecording(JSON.parse(localStorage.getItem('dataForm')));

document.querySelector('.days').addEventListener('click', (event) => {
    if (event.target.tagName != 'LI') return;
    
    document.querySelector('.days .active').classList.remove('active');
    event.target.classList.add('active');
    
    addWeatherInfoInApp(getUrl());
});

document.querySelector('.submit-weather-params-button').addEventListener('submit', () => addWeatherInfoInApp(getUrl()));

document.querySelector('.clear-weather-params-button').addEventListener('click', (event) => {
    event.preventDefault();
    const { 
        lat, 
        lon, 
        country,
        humidity, 
        wind,
        'city-name': city, 
        'zip-code': zipCode, 
        'select-weather-by-param': selectParams 
    } = document.forms['weather-filters'];

        selectParams.value = 'city';
        city.value = 'Minsk';
        lat.value = '';
        lon.value = '';
        country.value = '';
        zipCode.value = '';
        humidity.checked = false;
        wind.checked = false;
        localStorage.clear();
        showParamsWeatherBySelect();
});

document.querySelector('.select-weather-by-param').addEventListener('change', () => showParamsWeatherBySelect());

document.querySelector('.city-name').onchange = () => {
    const city = document.querySelector('.city-name');
    removeClass('error', city);
};

document.querySelector('.lat').onchange = document.querySelector('.lon').onchange = () => {
    const {
        lat, 
        lon
    } = document.forms['weather-filters'];
    removeClass('error', lat, lon);
};

document.querySelector('.country').onchange = document.querySelector('.zip-code').onchange = () => {
    const {
        country, 
        'zip-code': zipCode
    } = document.forms['weather-filters'];
    removeClass('error', country, zipCode);
};

window.addEventListener('beforeunload', () => {
    localStorage.setItem('dataForm', JSON.stringify(returnDataForm()));
});

function initialDataRecording(localData) {
    const {
        lat, 
        lon, 
        country, 
        humidity, 
        wind,
        'city-name': city, 
        'zip-code': zipCode, 
        'select-weather-by-param': selectParams
    } = document.forms['weather-filters'];

    if (localData) {
        switch (localData.selectParams) {
            case 'coords':
                lat.value = localData.lat;
                lon.value = localData.lon;
                break;
            case 'zip':
                country.value = localData.country;
                zipCode.value = localData.zipCode;
                break;
        }
        humidity.checked = localData.humidity;
        wind.checked = localData.wind;
    };

    selectParams.value = localData ? localData.selectParams : 'city';
    city.value = localData ? localData.city : 'Minsk';
    
    document.querySelector(`.days ${localData ? "#" + localData.days : "li"}`).classList.add('active');

    showParamsWeatherBySelect();
    addWeatherInfoInApp(getUrl());
};

function returnDataForm() {
    const { 
        lat, 
        lon, 
        country,
        humidity, 
        wind,
        'city-name': city, 
        'zip-code': zipCode, 
        'select-weather-by-param': selectParams 
    } = document.forms['weather-filters'];
    
    const dataForm = {
        city: city.value,
        lat: lat.value,
        lon: lon.value,
        country: country.value,
        zipCode: zipCode.value,
        selectParams: selectParams.value,
        humidity: humidity.checked,
        wind: wind.checked,
        days: document.querySelector('.days .active').id
    }

    return dataForm;
};

function addHtmlContentToPage(responseData) {
    const options = { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric' 
    };

    const selectDay = document.querySelector('.days .active').id;
    const nowDate = new Date();
    const currentDate = (selectDay == 'today') ? nowDate :
                        (selectDay == 'tomorrow') ? new Date(nowDate.getTime() + (24 * 60 * 60 * 1000)) : '';

    const {
        humidity, 
        wind
    } = document.forms['weather-filters'];

    let itemWeather = '';
    
    document.querySelector('.content').innerHTML = responseData.list.reduce((text, oneDayData) => {
        const time = oneDayData.dt_txt.split(' ')[1].split(':');
        const date = new Date(oneDayData.dt_txt);
        
        if ((selectDay == 'week') ? true : currentDate.getDate() === date.getDate()) {
            itemWeather +=
                `<div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-11">
                    <div class="weather-item">
                        <p class="weather-time">${time[0]}:${time[1]}</p>
                        <p class="weather-forecast">${Math.round(oneDayData.main.temp - 273) + '&deg;'}</p>
                        <p class="weather-icon"><img src="https://openweathermap.org/img/wn/${oneDayData.weather[0]['icon']}@2x.png"></p>
                        <div class="weather-info">
                            <p class="weather-desc">Outdoors ${oneDayData.weather[0]['description']}</p>
                            <p class="weather-humidity">${humidity.checked ? `Humidity ${oneDayData.main.humidity}%` : ''}</p>
                            <p class="weather-wind">${wind.checked ? `Wind speed: ${oneDayData.wind.speed} km/h` : ''}</p>
                        </div>
                    </div>
                </div>`;
        };

        if (time[0] == '21') {
            const formatDate = new Intl.DateTimeFormat('en', options).format(date);
            text += itemWeather ?
                `<div class="one-day">
                    <h2 class="weather-title">${responseData.city.name}: ${formatDate}</h2>
                    <div class="weather-container row justify-content-start">${itemWeather}</div></div>`
                : '';
            itemWeather = '';
        };

        return text;
    }, '');
};

function addWeatherInfoInApp(url){
    fetch(url)
    .then((resp) => resp.json())
    .then((data) => addHtmlContentToPage(data))
    .catch((e) => {
        console.log(e);
        const { 
            lat, 
            lon, 
            country,
            'city-name': city, 
            'zip-code': zipCode, 
            'select-weather-by-param': selectParams 
        } = document.forms['weather-filters'];

        switch (selectParams.value) {
            case 'city':
                addClass('error', city);
                break;
            case 'coords':
                addClass('error', lat, lon);
                break;
            case 'zip':
                addClass('error', country, zipCode);
                break;
        }
        document.querySelector('.content').innerHTML = 
            `<div class="error-data">No data was found for your request, please check the correctness of the entered data.</div>`;
    });
};

function getUrl() {
    const { 
        lat, 
        lon, 
        country,
        'city-name': city, 
        'zip-code': zipCode, 
        'select-weather-by-param': selectParams 
    } = document.forms['weather-filters'];

    switch (selectParams.value) {
        case 'city': 
            return (`http://api.openweathermap.org/data/2.5/forecast?q=${city.value}&lang=en&appid=80fceb75a14d5106f197a58ff38572dc`);
        case 'coords': 
            return (`http://api.openweathermap.org/data/2.5/forecast?lat=${lat.value}&lon=${lon.value}&lang=en&appid=80fceb75a14d5106f197a58ff38572dc`);
        case 'zip': 
            return (`http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode.value},${country.value}&lang=en&appid=80fceb75a14d5106f197a58ff38572dc`);
    }
};

function addClass(name, ...elems) {
    elems.forEach((elem) => elem.classList.add(name));
};

function removeClass(name, ...elems){
    elems.forEach((elem) => elem.classList.remove(name));
};

function showParamsWeatherBySelect() {
    const { 
        lat, 
        lon, 
        country,
        'city-name': city, 
        'zip-code': zipCode, 
        'select-weather-by-param': selectParams 
    } = document.forms['weather-filters'];

    switch (selectParams.value) {
        case 'city':
            addClass('hidden', lat, lon, country, zipCode);
            removeClass('hidden', city);
            break;
        case 'coords':
            addClass('hidden', city, country, zipCode);
            removeClass('hidden', lat, lon);
            break;
        case 'zip':
            addClass('hidden', lat, lon, city);
            removeClass('hidden', country, zipCode);
            break;
    }
}
