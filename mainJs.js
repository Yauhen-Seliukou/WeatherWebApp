
let dayInWeek = ['Воскресенье', 'Понедельник', 'Вторник', 
                 'Среда', 'Четверг', 'Пятница', 'Суббота'];
let monthInYear = ['января', 'февраля', 'марта', 'апреля', 
                   'мая', 'июня', 'июля', 'августа', 'сентября', 
                   'октября', 'ноября', 'декабря'];

document.forms[0].lat.style.display = 'none';
document.forms[0].lon.style.display = 'none';
document.forms[0].country.style.display = 'none';
document.forms[0].zipCode.style.display = 'none';
let cityName = document.forms[0].cityName.value = 'Минск';
let lat = document.forms[0].lat.value;
let lon = document.forms[0].lon.value;
let target = document.querySelector('.days').querySelector('li');
let humidity = document.querySelector('.humidity').querySelector('input').checked;
let wind = document.querySelector('.wind').querySelector('input').checked;
let url = 'http://api.openweathermap.org/data/2.5/forecast?q='+ cityName + 
              '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';

getWeatherDate(url, new Date(Date.now()));

function getWeatherDate(url, day){
    fetch(url)
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
            if (humidity) {
                newItemWeather.querySelector('.weatherHumidity').textContent = `Влажность ${listItem.main.humidity} %`;
            }
            if (wind) {
                newItemWeather.querySelector('.weatherWind').textContent = `Ветер ${listItem.wind.speed} км/ч`;
            }
        }
    })
      .catch(function (e) {
        //if (e.name == 'TypeError') {
            url = 'http://api.openweathermap.org/data/2.5/forecast?q=Minsk' + 
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
                  console.log(url);
            choiceDays();

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
            
            //alert('Введены некорректные данные.');
        /*} else {
            throw e;
        }*/
      });
}

function choiceDays() {
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

document.querySelector('.days').addEventListener('click', function(event){
    if (event.target.tagName != 'LI') return;
    
    target = event.target;
    let days = document.querySelector('.days');
    for (let li of days.querySelectorAll('li')) {
        li.classList = '';
    }
    target.classList.add('active');
    choiceDays();
})

document.querySelector('.buttonForm').addEventListener('click', function(event) {
    let formParams = document.forms[0];
    formParams.cityName.classList.remove('error');
    formParams.lat.classList.remove('error');
    formParams.lon.classList.remove('error');
    formParams.country.classList.remove('error');
    formParams.zipCode.classList.remove('error');
    cityName = formParams.cityName.value;
    humidity = document.querySelector('.humidity').querySelector('input').checked;
    wind = document.querySelector('.wind').querySelector('input').checked;

    switch (document.forms[0].choice.value) {
        case 'city':
            url = 'http://api.openweathermap.org/data/2.5/forecast?q='
                  + document.forms[0].cityName.value + 
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
        case 'coords':
            url = 'http://api.openweathermap.org/data/2.5/forecast?lat='
                  + document.forms[0].lat.value + '&lon='
                  + document.forms[0].lon.value +
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
        case 'zip':
            url = 'http://api.openweathermap.org/data/2.5/forecast?zip='
                  + document.forms[0].zipCode.value + ','
                  + document.forms[0].country.value +
                  '&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184';
            break;
    }
    choiceDays();
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
})