import { Test, TestingModule } from '@nestjs/testing';
import { NotificationWebsocketService } from '../services/notification.websocket.service';
import { io, Socket } from 'socket.io-client';
import { CreateNotificationDTO } from '../dto/notification.dto';

jest.mock('socket.io-client');

describe('NotificationWebsocketService', () => {
  let service: NotificationWebsocketService;
  let mockSocket: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationWebsocketService],
    }).compile();

    service = module.get<NotificationWebsocketService>(
      NotificationWebsocketService,
    );

    // Mocking socket.io-client
    mockSocket = {
      connected: true,
      emit: jest.fn(),
    } as any;
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should send notification when socket is connected', () => {
      const companyCode = 'ABC';
      const data: CreateNotificationDTO[] = [
        {
          title: 'A',
          user: 'A',
          detail: 'A',
          isReadOnly: false,
          isManager: false,
          severity: 'ok',
        },
      ];

      service.sendNotification(companyCode, data);
    });
  });
});
