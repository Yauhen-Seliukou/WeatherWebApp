const paramsWeather = {
    city: document.getElementsByName('city-name')[0],
    lat: document.getElementsByName('lat')[0],
    lon: document.getElementsByName('lon')[0],
    country: document.getElementsByName('country')[0],
    zipCode: document.getElementsByName('zip-code')[0],
    humidity: document.getElementsByName('humidity')[0],
    wind: document.getElementsByName('wind')[0],
    selectParams: document.getElementsByName('choice')[0],
    days: document.querySelector('.days').querySelector('li'),
}

paramsWeather.getUrl = function() {
    switch (this.selectParams.value) {
        case 'city': 
            return (`http://api.openweathermap.org/data/2.5/forecast?q=${this.city.value}&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184`);
        case 'coords': 
            return (`http://api.openweathermap.org/data/2.5/forecast?lat=${this.lat.value}&lon=${this.lon.value}&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184`);
        case 'zip': 
            return (`http://api.openweathermap.org/data/2.5/forecast?zip=${this.zipCode.value},${this.country.value}&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184`);
    }
}

initialDataRecording(JSON.parse(localStorage.getItem('dataForm')), paramsWeather);

document.querySelector('.days').addEventListener('click', function(event){
    if (event.target.tagName != 'LI') return;
    
    paramsWeather.days = event.target;
    const days = document.querySelector('.days').querySelectorAll('li');
    Array.from(days).map(li => li.classList.remove('active'));
    paramsWeather.days.classList.add('active');
    showWeather(paramsWeather.getUrl());
})

document.querySelector('.button-form').addEventListener('click', function(event) {
    showWeather(paramsWeather.getUrl());
})

document.querySelector('.header-title').addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.hidden = !sidebar.hidden;
})

paramsWeather.selectParams.addEventListener('click', function() {
    switch (paramsWeather.selectParams.value) {
        case 'city':
            addClass('hidden', paramsWeather.lat, paramsWeather.lon, paramsWeather.country, paramsWeather.zipCode);
            removeClass('hidden', paramsWeather.city);
            break;
        case 'coords':
            addClass('hidden', paramsWeather.city, paramsWeather.country, paramsWeather.zipCode);
            removeClass('hidden', paramsWeather.lat, paramsWeather.lon);
            break;
        case 'zip':
            addClass('hidden', paramsWeather.lat, paramsWeather.lon, paramsWeather.city);
            removeClass('hidden', paramsWeather.country, paramsWeather.zipCode);
            break;
    }
})

paramsWeather.city.oninput = function() {
    removeClass('error', paramsWeather.city);
}
paramsWeather.lat.oninput = paramsWeather.lon.oninput = function() {
    removeClass('error', paramsWeather.lat, paramsWeather.lon);
}
paramsWeather.country.oninput = paramsWeather.zipCode.oninput = function() {
    removeClass('error', paramsWeather.country, paramsWeather.zipCode);
}

window.addEventListener('beforeunload', function() {
    localStorage.setItem('dataForm', JSON.stringify(returnDataForm(paramsWeather)));
})

function initialDataRecording(localData, objData) {
    if (localData) {
        localData.cityVisible ? objData.city.classList.add('hidden') : '';
        localData.latVisible ? objData.lat.classList.add('hidden') : '';
        localData.lonVisible ? objData.lon.classList.add('hidden') : '';
        localData.countryVisible ? objData.country.classList.add('hidden') : '';
        localData.zipCodeVisible ? objData.zipCode.classList.add('hidden') : '';
    
        objData.city.value = (localData.city); 
        objData.selectParams.value = localData.selectParams;
        objData.lat.value = localData.lat;
        objData.lon.value = localData.lon;
        objData.country.value = localData.country;
        objData.zipCode.value = localData.zipCode;
        objData.humidity.checked = localData.humidity;
        objData.wind.checked = localData.wind;
        objData.days = document.querySelector('.days').querySelector(`#${localData.days}`);
    } else {
        objData.city.value = 'Минск';
        objData.selectParams.value = 'city';
        objData.lat.classList.add('hidden');
        objData.lon.classList.add('hidden');
        objData.country.classList.add('hidden');
        objData.zipCode.classList.add('hidden');
    }
    
    objData.days.classList.add('active');

    showWeather(paramsWeather.getUrl());
}

function returnDataForm(objData) {
    const dataForm = {
        city: objData.city.value,
        lat: objData.lat.value,
        lon: objData.lon.value,
        country: objData.country.value,
        zipCode: objData.zipCode.value,
        
        cityVisible: objData.city.classList.contains('hidden'),
        latVisible: objData.lat.classList.contains('hidden'),
        lonVisible: objData.lon.classList.contains('hidden'),
        countryVisible: objData.country.classList.contains('hidden'),
        zipCodeVisible: objData.zipCode.classList.contains('hidden'),
        
        humidity: objData.humidity.checked,
        wind: objData.wind.checked,
        selectParams: objData.selectParams.value,
        days: objData.days.getAttribute('id')
    }
    return dataForm;
}

function createHTMLByParameters(serverData, dateWeather) {
    const options = { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric' 
    };
    const formatDate = new Intl.DateTimeFormat('ru', options).format(dateWeather);

    let stringCode = '';
    stringCode +=  `<h2 class="weather-title">${serverData.city.name}: ${formatDate}</h2>`;
    stringCode += `<div class="container">`;

    for (const oneDayData of serverData.list) {
        const time = oneDayData.dt_txt.split(' ')[1].split(':');
        const date = new Date(oneDayData.dt_txt.split(' ')[0].split('-').join(','));
        
        if (dateWeather.getDate() !== date.getDate()) continue;
        if (time[0] < '09') continue;

        stringCode += `<div class="weather">`;
        stringCode += `<p class="weather-time">${time[0]}:${time[1]}</p>`;
        stringCode += `<p class="weather-forecast">${Math.round(oneDayData.main.temp - 273) + '&deg;'}</p>`;
        stringCode += `<p class="weather-icon"><img src="https://openweathermap.org/img/wn/${oneDayData.weather[0]['icon']}@2x.png"></p>`;
        stringCode += `<div class="weather-info">`;
        stringCode += `<p class="weather-desc">На улице ${oneDayData.weather[0]['description']}</p>`;
        stringCode += `<p class="weather-humidity">Влажность ${oneDayData.main.humidity} %</p>`;
        stringCode += `<p class="weather-wind">Ветер ${oneDayData.wind.speed} км/ч</p>`;
        stringCode += `</div></div>`;
    }
    stringCode += `</div>`
    return stringCode;
}

function addInfoInApp(html) {
    const div = document.createElement('div');
    div.classList.add('one-day');
    div.innerHTML = html;
    if (paramsWeather.humidity.checked) {
        Array.from(div.querySelectorAll('.weather-humidity')).map(item => item.classList.remove('hidden'));
    } else {
        Array.from(div.querySelectorAll('.weather-humidity')).map(item => item.classList.add('hidden'));
    }
    if (paramsWeather.wind.checked) {
        Array.from(div.querySelectorAll('.weather-wind')).map(item => item.classList.remove('hidden'));
    } else {
        Array.from(div.querySelectorAll('.weather-wind')).map(item => item.classList.add('hidden'));
    }
            
    document.querySelector('.content').append(div);
}

function getWeatherDate(url, day, numberOfDays){
    fetch(url).then(function(resp) {
        return resp.json() 
    })
    .then(function(data) {
        for (let i = 0; i < numberOfDays; i++) {
            const currentDate = new Date(day.getFullYear(), day.getMonth(), day.getDate() + i);
            const html = createHTMLByParameters(data, currentDate);
            addInfoInApp(html);
        }
    })
    .catch(function (e) {
        console.log(e);
        switch (paramsWeather.selectParams.value) {
            case 'city':
                addClass('error', paramsWeather.city);
                break;
            case 'coords':
                addClass('error', paramsWeather.lat, paramsWeather.lon);
                break;
            case 'zip':
                addClass('error', paramsWeather.country, paramsWeather.zipCode);
                break;
        }
        const url = 'http://api.openweathermap.org/data/2.5/forecast?q=Minsk&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
        showWeather(url);
    });
}

function showWeather(url) {
    const dateNow = new Date();
    switch (paramsWeather.days.id) {
        case 'today':
            document.querySelector('.content').innerHTML = '';
            getWeatherDate(url, dateNow, 1);
            break;
        case 'tomorrow':
            document.querySelector('.content').innerHTML = '';
            let dateTommorow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1);
            getWeatherDate(url, dateTommorow, 1);
            break;
        case 'week':
            document.querySelector('.content').innerHTML = '';
            getWeatherDate(url, dateNow, 5);
            break;
    }
}

function addClass(name, ...elems) {
    elems.map((elem) => elem.classList.add(name));
}

function removeClass(name, ...elems){
    elems.map((elem) => elem.classList.remove(name));
}
