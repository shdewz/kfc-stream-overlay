let comingup;
(async () => {
	$.ajaxSetup({ cache: false });
	comingup = await $.getJSON('../_data/coming_up.json');

	let timer_end = comingup.time - 0 * 60 * 60 * 1000;
	if (timer_end > Date.now()) {
		let timer_int = setInterval(() => {
			if (timer_end < Date.now()) {
				clearInterval(timer_int);
				if (timer) timer.innerHTML = '00:00';
			}
			let remaining = Math.floor((timer_end - Date.now()) / 1000);
			let hours = Math.floor(remaining / 60 / 60);
			let date = new Date(null);
			date.setSeconds(remaining);
			let text = hours > 0 ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);

			// let text = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			if (timer && remaining > 0) timer.innerHTML = text;
		}, 1000);
	}
})();

let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

let title = document.getElementById('title');
let time = document.getElementById('time');
let timer = document.getElementById('timer');

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let tempTime, tempMapName;

socket.onmessage = event => {
	let data = JSON.parse(event.data);

	if (tempMapName !== `${data.menu.bm.metadata.artist} - ${data.menu.bm.metadata.title}`) {
		tempMapName = `${data.menu.bm.metadata.artist} - ${data.menu.bm.metadata.title}`;
		title.innerHTML = `<span id="note">♪</span> ${tempMapName}`;
	}

	if (comingup && tempTime !== comingup.time) {
		tempTime = comingup.time;
		time.innerHTML = `${new Date(tempTime).toUTCString().substring(17, 22)} UTC`;
	}
}
