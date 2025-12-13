import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || '';

interface InquiryRequest {
  reviewText: string;
  userName: string;
  mailAddress: string;
}

interface InquiryItem {
  id: string;
  reviewText: string;
  userName: string;
  mailAddress: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: InquiryRequest = JSON.parse(event.body);

    if (!body.reviewText || !body.userName || !body.mailAddress) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'reviewText, userName, and mailAddress are required fields',
        }),
      };
    }

    const item: InquiryItem = {
      id: randomUUID(),
      reviewText: body.reviewText,
      userName: body.userName,
      mailAddress: body.mailAddress,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Inquiry submitted successfully',
        id: item.id,
      }),
    };
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
