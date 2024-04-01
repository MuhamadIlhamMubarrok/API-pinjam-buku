import { Injectable } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { CreateNotificationDTO } from 'src/dto/transaction.dto';

@Injectable()
export class NotificationWebsocketService {
  private socket: Socket;

  constructor() {
    const url = process.env.NOTIFICATION_API;
    this.socket = io(url);
    this.socket.on('open', () => {
      console.log('WebSocket client connected');
    });

    this.socket.on('message', (data) => {
      console.log('Received message:', data.toString());
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  sendNotification(companyCode: string, data: CreateNotificationDTO[]) {
    if (this.socket.connected) {
      this.socket.emit('notifications', {
        companyCode: companyCode,
        data: data,
      });
    } else {
      console.error('WebSocket not connected, cannot send message');
      throw new Error('Websocket not connected, cannot send message');
    }
  }
}
