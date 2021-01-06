
let dayInWeek = ['Воскресенье', 'Понедельник', 'Вторник', 
                 'Среда', 'Четверг', 'Пятница', 'Суббота'];
let monthInYear = ['января', 'февраля', 'марта', 'апреля', 
                   'мая', 'июня', 'июля', 'августа', 'сентября', 
                   'октября', 'ноября', 'декабря'];

document.forms[0].cityName.style.display = (+localStorage.getItem('localCityVisible')) ? 'none' : '';
document.forms[0].lat.style.display = (+localStorage.getItem('localLatVisible')) ? 'none' : '';
document.forms[0].lon.style.display = (+localStorage.getItem('localLonVisible')) ? 'none' : '';
document.forms[0].country.style.display = (+localStorage.getItem('localCountryVisible')) ? 'none' : '';
document.forms[0].zipCode.style.display = (+localStorage.getItem('localZipCodeVisible')) ? 'none' : '';

let cityName = document.forms[0].cityName.value = localStorage.getItem('localCity') 
                                                ? localStorage.getItem('localCity') : 'Минск';

document.forms[0].choice.value = localStorage.getItem('localChoiceSearch') 
                                                ? localStorage.getItem('localChoiceSearch') : 'city';

document.forms[0].lat.value = localStorage.getItem('localLatCoords') 
                            ? (+localStorage.getItem('localLatCoords')) : '';
document.forms[0].lon.value = localStorage.getItem('localLonCoords') 
                            ? (+localStorage.getItem('localLonCoords')) : '';

document.forms[0].country.value = localStorage.getItem('localCountryParam') 
                                ? localStorage.getItem('localCountryParam') : '';
document.forms[0].zipCode.value = localStorage.getItem('localZipCodeParam') 
                                ? (+localStorage.getItem('localZipCodeParam')) : '';

let target = localStorage.getItem('localDaysTarget') 
            ? document.querySelector('.days').querySelector(`#${localStorage.getItem('localDaysTarget')}`) 
            : document.querySelector('.days').querySelector('li');
target.classList.add('active');

document.forms[0].humidity.checked = (+localStorage.getItem('localHumidity')) ? true : false;
document.forms[0].wind.checked = (+localStorage.getItem('localWind')) ? true : false;

let url = createUrl();
choiceDays(url);

function getWeatherDate(url, day){
    fetch(url)
      .then(function (response) {
        if (response.status !== 200) {
          return Promise.reject(new Error(response.statusText))
        }
        return Promise.resolve(response)
      })
      .then(function (resp) {return resp.json() })
      .then(function (data) {
        let forOneDayDiv = document.createElement('div');
        forOneDayDiv.classList.add('forOneDay');
        document.querySelector('.content').append(forOneDayDiv);
        
        let title = document.createElement('h2');
        title.classList.add('weatherTitle');
        forOneDayDiv.append(title);
        title.textContent = data.city.name + ':' + dayInWeek[day.getDay()] + ' ' 
                                                 + day.getDate() + ' ' 
                                                 + monthInYear[day.getMonth()] + ' ' 
                                                 + day.getFullYear();
    
        let container = document.createElement('div');
        container.classList.add('container');
        
        for (let listItem of data.list) {
            let time = listItem.dt_txt.split(' ')[1].split(':');
            let date = new Date(listItem.dt_txt.split(' ')[0].split('-').join(','));
            
            if (day.getDate() !== date.getDate()) continue;
            if (time[0] < '09') continue;
            
            let newItemWeather = document.createElement('div');
            newItemWeather.append(document.querySelector('#itemWeather').content.cloneNode(true));
            
            forOneDayDiv.append(container);
            container.append(newItemWeather);
                
            newItemWeather.querySelector('.weatherTime').textContent = `${time[0]}:${time[1]}`;
            newItemWeather.querySelector('.weatherIcon').innerHTML = `<img src="https://openweathermap.org/img/wn/${listItem.weather[0]['icon']}@2x.png">`;
            newItemWeather.querySelector('.weatherForecast').innerHTML = Math.round(listItem.main.temp - 273) + '&deg;';
            newItemWeather.querySelector('.weatherDesc').textContent = `На улице ${listItem.weather[0]['description']}`;
            if (document.forms[0].humidity.checked) {
                newItemWeather.querySelector('.weatherHumidity').textContent = `Влажность ${listItem.main.humidity} %`;
            }
            if (document.forms[0].wind.checked) {
                newItemWeather.querySelector('.weatherWind').textContent = `Ветер ${listItem.wind.speed} км/ч`;
            }
        }
    })
      .catch(function (e) {
            switch (document.forms[0].choice.value) {
                case 'city':
                    document.forms[0].cityName.classList.add('error');
                    break;
                case 'coords':
                    document.forms[0].lat.classList.add('error');
                    document.forms[0].lon.classList.add('error');
                    break;
                case 'zip':
                    document.forms[0].country.classList.add('error');
                    document.forms[0].zipCode.classList.add('error');
                    break;
            }
            url = 'http://api.openweathermap.org/data/2.5/forecast?q=Minsk' + 
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            choiceDays(url);
      });
}

function choiceDays(url) {
    let dateNow = new Date(Date.now());
    switch (target.id) {
        case 'today':
            document.querySelector('.content').innerHTML = '';
            getWeatherDate(url, dateNow);
            break;
        case 'tomorrow':
            document.querySelector('.content').innerHTML = '';
            let dateTommorow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1);
            getWeatherDate(url, dateTommorow);
            break;
        case 'week':
            document.querySelector('.content').innerHTML = '';
            for (let i = 0; i < 5; i++) {
                let currentDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + i);
                getWeatherDate(url, currentDate);
            }
            break;
    }
}

function createUrl() {
    let newUrl;
    switch (document.forms[0].choice.value) {
        case 'city':
            newUrl = 'http://api.openweathermap.org/data/2.5/forecast?q='
                  + document.forms[0].cityName.value + 
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
        case 'coords':
            newUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat='
                  + document.forms[0].lat.value + '&lon='
                  + document.forms[0].lon.value +
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
        case 'zip':
            if (document.forms[0].country.value === '') document.forms[0].country.value = 'us';
            newUrl = 'http://api.openweathermap.org/data/2.5/forecast?zip='
                  + document.forms[0].zipCode.value + ','
                  + document.forms[0].country.value +
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
    }
    return newUrl;
}

document.querySelector('.days').addEventListener('click', function(event){
    if (event.target.tagName != 'LI') return;
    
    target = event.target;
    let days = document.querySelector('.days');
    for (let li of days.querySelectorAll('li')) {
        li.classList = '';
    }
    target.classList.add('active');
    choiceDays(url);
})

document.querySelector('.buttonForm').addEventListener('click', function(event) {
    url = createUrl();
    choiceDays(url);
})

document.querySelector('.openSidebar').addEventListener('click', function() {
    let sidebar = document.querySelector('.sidebar');
    sidebar.hidden = !sidebar.hidden;
})

document.forms[0].choice.addEventListener('click', function(event) {
    switch (document.forms[0].choice.value) {
        case 'city':
            document.forms[0].cityName.style.display = '';
            document.forms[0].lat.style.display = 'none';
            document.forms[0].lon.style.display = 'none';
            document.forms[0].country.style.display = 'none';
            document.forms[0].zipCode.style.display = 'none';
            break;
        case 'coords':
            document.forms[0].cityName.style.display = 'none';
            document.forms[0].country.style.display = 'none';
            document.forms[0].zipCode.style.display = 'none';
            document.forms[0].lat.style.display = '';
            document.forms[0].lon.style.display = '';
            break;
        case 'zip':
            document.forms[0].cityName.style.display = 'none';
            document.forms[0].lat.style.display = 'none';
            document.forms[0].lon.style.display = 'none';
            document.forms[0].country.style.display = '';
            document.forms[0].zipCode.style.display = '';
            break;
    }

    localStorage.setItem('localChoiceSearch', document.forms[0].choice.value);
})

document.forms[0].cityName.oninput = function() {
    document.forms[0].cityName.classList.remove('error');
}
document.forms[0].lat.oninput = document.forms[0].lon.oninput = function() {
    document.forms[0].lat.classList.remove('error');
    document.forms[0].lon.classList.remove('error');
}
document.forms[0].country.oninput = document.forms[0].zipCode.oninput = function() {
    document.forms[0].country.classList.remove('error');
    document.forms[0].zipCode.classList.remove('error');
}

window.addEventListener('beforeunload', function() {
    localStorage.setItem('localDaysTarget', target.id);

    localStorage.setItem('localCity', document.forms[0].cityName.value);
    localStorage.setItem('localHumidity', document.forms[0].humidity.checked ? 1 : 0);
    localStorage.setItem('localWind', document.forms[0].wind.checked  ? 1 : 0);

    localStorage.setItem('localCityVisible', document.forms[0].cityName.style.display ? 1 : 0);
    localStorage.setItem('localLatVisible', document.forms[0].lat.style.display ? 1 : 0);
    localStorage.setItem('localLonVisible', document.forms[0].lon.style.display ? 1 : 0);
    localStorage.setItem('localCountryVisible', document.forms[0].country.style.display ? 1 : 0);
    localStorage.setItem('localZipCodeVisible', document.forms[0].zipCode.style.display ? 1 : 0);

    localStorage.setItem('localLatCoords', document.forms[0].lat.value);
    localStorage.setItem('localLonCoords', document.forms[0].lon.value);
    localStorage.setItem('localZipCodeParam', document.forms[0].zipCode.value);
    localStorage.setItem('localCountryParam', document.forms[0].country.value);
})
