import json
import os
import uuid
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')


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
        item = {
            'id': item_id,
            'reviewText': review_text,
            'userName': user_name,
            'mailAddress': mail_address
        }

        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item=item)

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
