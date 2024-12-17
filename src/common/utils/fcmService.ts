import { Injectable } from '@nestjs/common';
import { mapLimit } from 'async';
import * as admin from 'firebase-admin';
import { chunk } from 'lodash';
import * as path from 'path';

const MAX_MESSAGE_COUNT_PER_REQUEST = 500;

export interface IFCMItem {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class FCMService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(
        path.resolve(__dirname, '../../../configs/firebase-adminsdk.json'),
      ),
    });
  }

  private tokenMessage({ message, title, token }: IFCMItem) {
    return {
      token,
      notification: { title, body: message },
      apns: {
        payload: {
          aps: { 'content-available': 1 },
        },
      },
    };
  }

  public async send(items: IFCMItem[], dryRun?: boolean): Promise<admin.messaging.BatchResponse> {
    const batchedMessages = chunk(items, MAX_MESSAGE_COUNT_PER_REQUEST);

    const batchResponses = await mapLimit<IFCMItem[], admin.messaging.BatchResponse>(
      batchedMessages,
      parseInt(process.env.FCM_PARALLEL_LIMIT),
      async (groupedMessages: IFCMItem[]) => {
        try {
          const messages: admin.messaging.TokenMessage[] = groupedMessages.map(this.tokenMessage);

          return await admin.messaging().sendEach(messages, dryRun);
        } catch (error) {
          return {
            responses: groupedMessages.map(() => ({ success: false, error })),
            successCount: 0,
            failureCount: groupedMessages.length,
          };
        }
      },
    );

    return batchResponses.reduce(
      ({ responses, successCount, failureCount }, currentResponse) => ({
        responses: responses.concat(currentResponse.responses),
        successCount: successCount + currentResponse.successCount,
        failureCount: failureCount + currentResponse.failureCount,
      }),
      { responses: [], successCount: 0, failureCount: 0 },
    );
  }
}
