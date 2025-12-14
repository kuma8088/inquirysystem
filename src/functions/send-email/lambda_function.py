import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', '')


def get_inquiry(inquiry_id):
    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(Key={'id': inquiry_id})
    return response.get('Item')


def send_email(to_address, subject, body):
    response = ses.send_email(
        Source=SENDER_EMAIL,
        Destination={
            'ToAddresses': [to_address]
        },
        Message={
            'Subject': {
                'Data': subject,
                'Charset': 'UTF-8'
            },
            'Body': {
                'Text': {
                    'Data': body,
                    'Charset': 'UTF-8'
                }
            }
        }
    )
    return response


def handler(event, context):
    try:
        inquiry_id = event.get('id')
        if not inquiry_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'id is required'})
            }

        inquiry = get_inquiry(inquiry_id)
        if not inquiry:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Inquiry not found'})
            }

        mail_address = inquiry.get('mailAddress')
        answer = inquiry.get('answer')
        user_name = inquiry.get('userName', 'お客様')

        if not mail_address:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'mailAddress not found'})
            }

        if not answer:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'answer not found'})
            }

        subject = '【ホテル予約サイト】お問い合わせへの回答'
        body = f"""{user_name} 様

お問い合わせいただきありがとうございます。
以下、ご質問への回答です。

---
{answer}
---

ご不明な点がございましたら、お気軽にお問い合わせください。

ホテル予約サイト カスタマーサポート
"""

        send_email(mail_address, subject, body)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Email sent successfully',
                'id': inquiry_id
            }, ensure_ascii=False)
        }

    except ClientError as e:
        print(f'AWS error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
