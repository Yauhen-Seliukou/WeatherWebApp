
let dayInWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
let cityName = document.querySelector('.cityName').value;

function getWeatherDate(date, city = 'Minsk'){
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=3bca9c3f828ed0b6bfbbfe2affb63184`;
    fetch(url)
      .then(function (resp) {return resp.json() })
      .then(function (data) {
        document.querySelector('.weatherTitle').textContent = `Погода в городе: ${data.name}`;
        document.querySelector('.weatherDate').textContent = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        document.querySelector('.weatherDay').textContent = dayInWeek[date.getDay()];
        document.querySelector('.weatherIcon').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png">`;
        document.querySelector('.weatherForecast').innerHTML = `Температура составляет ${Math.round(data.main.temp - 273) + '&deg;'}`;
        document.querySelector('.weatherDesc').textContent = `На улице ${data.weather[0]['description']}`;
        //document.querySelector('.weatherHumidity').textContent = `Влажность ${data.[0]['description']}`;
        //document.querySelector('.weatherWind').textContent = `Ветер ${data.wind[0]['wind.speed']} км/ч`;
 
    })
      .catch(function (e) {
        console.log(e);
      });
}

document.querySelector('.days').addEventListener('click', function(event){
    if (event.target.tagName != 'LI') return;
    
    let target = event.target;
    let dateNow = new Date(Date.now());
    switch (target.id) {
        case 'now':
            getWeatherDate(dateNow, cityName);
            break;
        case 'today':
            getWeatherDate(dateNow, cityName);
            break;
        case 'tomorrow':
            let dateTommorow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1);
            getWeatherDate(dateTommorow, cityName);
            break;
    }

})

document.querySelector('.buttonForm').addEventListener('click', function(event) {
    cityName = document.querySelector('.cityName').value;
    let dateNow = new Date(Date.now());
    getWeatherDate(dateNow, cityName);
})

