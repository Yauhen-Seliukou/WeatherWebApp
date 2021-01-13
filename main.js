
initialDataRecording(JSON.parse(localStorage.getItem('dataForm')));

document.querySelector('.days').addEventListener('click', function(event){
    if (event.target.tagName != 'LI') return;
    
    let days = document.querySelector('.days .active');
    days.classList.remove('active');
    days = event.target;
    days.classList.add('active');
    
    showWeather(getUrl());
});

document.querySelector('.button-submit-weather-params').addEventListener('submit', () => showWeather(getUrl()));

document.querySelector('.header-title').addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    /*if (sidebar.classList.contains('open-sidebar')) {
        removeClass('open-sidebar', sidebar);
        addClass('close-sidebar', sidebar);
    } else {
        removeClass('close-sidebar', sidebar);
        addClass('open-sidebar', sidebar)
    }*/
    sidebar.hidden = !sidebar.hidden;
});

document.querySelector('.select-weather-param').addEventListener('change', () => showParamsWeatherBySelect());

document.querySelector('.city-name').oninput = function() {
    const city = document.querySelector('.city-name');
    removeClass('error', city);
};

document.querySelector('.lat').oninput = document.querySelector('.lon').oninput = function() {
    const {lat, lon} = document.forms['weather-params'];
    removeClass('error', lat, lon);
};

document.querySelector('.country').oninput = document.querySelector('.zip-code').oninput = function() {
    const {country, 'zip-code': zipCode} = document.forms['weather-params'];
    removeClass('error', country, zipCode);
};

window.addEventListener('beforeunload', function() {
    localStorage.setItem('dataForm', JSON.stringify(returnDataForm()));
});

function initialDataRecording(localData) {
    let days;
    const {'city-name': city, lat, lon, country, 
           'zip-code': zipCode, 'select-weather-param': selectParams,
            humidity, wind} = document.forms['weather-params'];

    if (localData) {
        switch (localData.selectParams) {
            case 'city':
                city.value = localData.city;
                break;
            case 'coords':
                lat.value = localData.lat;
                lon.value = localData.lon;
                break;
            case 'zip':
                country.value = localData.country;
                zipCode.value = localData.zipCode;
                break;
        }
        selectParams.value = localData.selectParams;
        humidity.checked = localData.humidity;
        wind.checked = localData.wind;
        days = document.querySelector(`.days #${localData.days}`);
    } else {
        document.forms['weather-params']['city-name'].value = 'Минск';
        document.forms['weather-params']['select-weather-param'].value = 'city';
        days = document.querySelector('.days li');
    }

    showParamsWeatherBySelect()
    
    days.classList.add('active');

    showWeather(getUrl());
};

function returnDataForm() {
    const {'city-name': city, lat, lon, country, 
           'zip-code': zipCode, 'select-weather-param': selectParams,
            humidity, wind} = document.forms['weather-params'];
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

function createHtmlContentForOneDay(responseData, dateWeather) {
    const options = { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric' 
    };
    const formatDate = new Intl.DateTimeFormat('ru', options).format(dateWeather);

    const {humidity, wind} = document.forms['weather-params'];
    
    const html = responseData.list.reduce((text, oneDayData) => {
        const time = oneDayData.dt_txt.split(' ')[1].split(':');
        const date = new Date(oneDayData.dt_txt.split(' ')[0].split('-').join(','));
        
        if (dateWeather.getDate() == date.getDate() && time[0] >= '09') {
            text +=
                `<div class="weather-item">
                    <p class="weather-time">${time[0]}:${time[1]}</p>
                    <p class="weather-forecast">${Math.round(oneDayData.main.temp - 273) + '&deg;'}</p>
                    <p class="weather-icon"><img src="https://openweathermap.org/img/wn/${oneDayData.weather[0]['icon']}@2x.png"></p>
                    <div class="weather-info">
                        <p class="weather-desc">На улице ${oneDayData.weather[0]['description']}</p>
                        <p class="weather-humidity">${humidity.checked ? `Влажность ${oneDayData.main.humidity}%` : ''}</p>
                        <p class="weather-wind">${wind.checked ? `Ветер: ${oneDayData.wind.speed} км/ч` : ''}</p>
                    </div>
                </div>`;
        }
        return text;
    }, '');

    return `<div class="one-day">
            <h2 class="weather-title">${responseData.city.name}: ${formatDate}</h2>
            <div class="weather-container">${html}</div></div>`;
};

function addInfoInApp(url, dateWeather, numberOfDays){
    fetch(url).then(function(resp) {
        return resp.json() 
    })
    .then(function(data) {
        let html = ''
        for (let i = 0; i < numberOfDays; i++) {
            const currentDate = new Date(dateWeather.getFullYear(), dateWeather.getMonth(), dateWeather.getDate() + i);
            html += createHtmlContentForOneDay(data, currentDate);
        }
        document.querySelector('.content').innerHTML = html;
    })
    .catch(function (e) {
        console.log(e);
        const {'city-name': city, lat, lon, country, 
               'zip-code': zipCode, 'select-weather-param': selectParams,
                humidity, wind} = document.forms['weather-params'];

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
            `<div class="error-data">Данных по Вашему запросу не найдено, проверьте правильность введенных данных.</div>`;
    });
};

function showWeather(url) {
    const dateNow = new Date();
    switch (document.querySelector('.days .active').id) {
        case 'today':
            addInfoInApp(url, dateNow, 1); 
            break;
        case 'tomorrow':
            const dateTommorow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1);
            addInfoInApp(url, dateTommorow, 1);
            break;
        case 'week':
            addInfoInApp(url, dateNow, 5);
            break;
    }
};

function getUrl() {
    const {'city-name': city, lat, lon, country, 
           'zip-code': zipCode, 'select-weather-param': selectParams} = document.forms['weather-params'];

    switch (selectParams.value) {
        case 'city': 
            return (`http://api.openweathermap.org/data/2.5/forecast?q=${city.value}&lang=ru&appid=80fceb75a14d5106f197a58ff38572dc`);
        case 'coords': 
            return (`http://api.openweathermap.org/data/2.5/forecast?lat=${lat.value}&lon=${lon.value}&lang=ru&appid=80fceb75a14d5106f197a58ff38572dc`);
        case 'zip': 
            return (`http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode.value},${country.value}&lang=ru&appid=80fceb75a14d5106f197a58ff38572dc`);
    }
};

function addClass(name, ...elems) {
    elems.map((elem) => elem.classList.add(name));
};

function removeClass(name, ...elems){
    elems.map((elem) => elem.classList.remove(name));
};

function showParamsWeatherBySelect() {
    const {'city-name': city, lat, lon, country, 
           'zip-code': zipCode, 'select-weather-param': selectParams} = document.forms['weather-params'];

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
