import { createConnection } from 'net';

export function checkConnection(port: number, host?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection(port, host, function () {
      resolve();
      socket.end();
    });
    socket.on('error', function (err) {
      reject(err);
    });
  });
}
