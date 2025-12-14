import json
import os
import uuid
from datetime import datetime, timezone, timedelta
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')
SQS_QUEUE_URL = os.environ.get('SQS_QUEUE_URL', '')

JST = timezone(timedelta(hours=9))


def handler(event, context):
    try:
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Request body is required'})
            }

        body = json.loads(event['body'])

        review_text = body.get('reviewText')
        user_name = body.get('userName')
        mail_address = body.get('mailAddress')

        if not review_text or not user_name or not mail_address:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'reviewText, userName, and mailAddress are required fields'
                })
            }

        item_id = str(uuid.uuid4())
        created_date = datetime.now(JST).strftime('%Y-%m-%d')

        item = {
            'id': item_id,
            'reviewText': review_text,
            'userName': user_name,
            'mailAddress': mail_address,
            'createdDate': created_date
        }

        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item=item)

        # SQS にメッセージを送信
        if SQS_QUEUE_URL:
            sqs.send_message(
                QueueUrl=SQS_QUEUE_URL,
                MessageBody=json.dumps({'id': item_id})
            )

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'message': 'Inquiry submitted successfully',
                'id': item_id
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON format'})
        }
    except ClientError as e:
        print(f'DynamoDB error: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
    except Exception as e:
        print(f'Error processing inquiry: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
