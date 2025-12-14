import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
bedrock = boto3.client('bedrock-runtime')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')
S3_BUCKET = os.environ.get('S3_BUCKET', '')
RAG_KEY = os.environ.get('RAG_KEY', 'hotel_info.json')
MODEL_ID = os.environ.get('MODEL_ID', 'apac.amazon.nova-micro-v1:0')


def get_rag_data():
    try:
        response = s3.get_object(Bucket=S3_BUCKET, Key=RAG_KEY)
        return json.loads(response['Body'].read().decode('utf-8'))
    except ClientError as e:
        print(f'S3 error: {e}')
        return {}


def get_inquiry(inquiry_id):
    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(Key={'id': inquiry_id})
    return response.get('Item')


def generate_answer(review_text, rag_data):
    rag_context = json.dumps(rag_data, ensure_ascii=False, indent=2)

    prompt = f"""あなたはホテルのカスタマーサポート担当者です。
以下のホテル情報を参考に、お客様の問い合わせに丁寧に回答してください。

【ホテル情報】
{rag_context}

【お客様の問い合わせ】
{review_text}

【回答】"""

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 1024
        }
    })

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )

    response_body = json.loads(response['body'].read())
    return response_body['output']['message']['content'][0]['text']


def update_answer(inquiry_id, answer):
    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={'id': inquiry_id},
        UpdateExpression='SET answer = :answer',
        ExpressionAttributeValues={':answer': answer}
    )


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

        review_text = inquiry.get('reviewText', '')
        if not review_text:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'reviewText is empty'})
            }

        rag_data = get_rag_data()
        answer = generate_answer(review_text, rag_data)
        update_answer(inquiry_id, answer)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Answer created successfully',
                'id': inquiry_id,
                'answer': answer
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
