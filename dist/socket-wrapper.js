//**Wraps a TCP socket with the WebSocket API */
class SocketWrapper {
    onopen;
    onclose;
    onerror;
    onmessage;
    send;
    close;
    constructor(connection, socket) {
        socket.on('connect', () => {
            this.onopen && this.onopen();
        });
        socket.on('close', () => {
            this.onclose && this.onclose();
        });
        socket.on('error', (error) => {
            this.onerror && this.onerror(error);
        });
        socket.on('data', (data) => {
            this.onmessage && this.onmessage({ data });
        });
        this.send = (message) => {
            socket.write(message);
        };
        this.close = () => {
            socket.removeAllListeners();
            socket.destroy();
        };
        const url = new URL(connection);
        const { host } = url;
        const [nodeIP, port] = host.split(':');
        socket.connect(parseInt(port), nodeIP);
    }
}
export default SocketWrapper;
//# sourceMappingURL=socket-wrapper.js.map