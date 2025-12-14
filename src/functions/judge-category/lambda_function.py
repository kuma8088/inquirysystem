import json
import os
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')
MODEL_ID = os.environ.get('MODEL_ID', 'apac.amazon.nova-micro-v1:0')

CATEGORIES = [
    "質問",
    "改善要望",
    "ポジティブな感想",
    "ネガティブな感想",
    "その他"
]


def get_inquiry(inquiry_id):
    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(Key={'id': inquiry_id})
    return response.get('Item')


def classify_category(review_text):
    categories_str = '\n'.join([f'- {cat}' for cat in CATEGORIES])

    prompt = f"""あなたは問い合わせ分類システムです。
以下の問い合わせ内容を、指定されたカテゴリのいずれかに分類してください。

【カテゴリ】
{categories_str}

【問い合わせ内容】
{review_text}

【分類結果】
上記のカテゴリから1つだけ選び、そのカテゴリ名のみを回答してください。"""

    body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 50
        }
    })

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )

    response_body = json.loads(response['body'].read())
    raw_category = response_body['output']['message']['content'][0]['text'].strip()

    for cat in CATEGORIES:
        if cat in raw_category:
            return cat

    return "その他"


def update_category(inquiry_id, category):
    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={'id': inquiry_id},
        UpdateExpression='SET Category = :category',
        ExpressionAttributeValues={':category': category}
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

        category = classify_category(review_text)
        update_category(inquiry_id, category)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Category judged successfully',
                'id': inquiry_id,
                'category': category
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
