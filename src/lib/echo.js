import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

export const getEcho = (token = null) => {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!echoInstance) {
        window.Pusher = Pusher;
        
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: 'e7dxhe4hxglu51vqpegz',
            wsHost: '127.0.0.1',
            wsPort: 8080,
            wssPort: 8080,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
            authEndpoint: 'http://trading.test/api/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    Accept: 'application/json',
                },
            },
        });
    }

    return echoInstance;
};

export const reconnectEcho = (token) => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
    return getEcho(token);
};

