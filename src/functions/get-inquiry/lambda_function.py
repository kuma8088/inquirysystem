import json
import os
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')


def handler(event, context):
    """
    GET /inquiry/{id} - 単一問い合わせ取得
    GET /inquiry?mailAddress=xxx - メールアドレスで問い合わせ一覧取得
    """
    try:
        table = dynamodb.Table(TABLE_NAME)

        # パスパラメータからID取得
        path_params = event.get('pathParameters') or {}
        inquiry_id = path_params.get('id')

        if inquiry_id:
            # GET /inquiry/{id}
            return get_by_id(table, inquiry_id)

        # クエリパラメータからmailAddress取得
        query_params = event.get('queryStringParameters') or {}
        mail_address = query_params.get('mailAddress')

        if mail_address:
            # GET /inquiry?mailAddress=xxx
            return get_by_mail_address(table, mail_address)

        # パラメータなし
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Either id path parameter or mailAddress query parameter is required'
            })
        }

    except ClientError as e:
        print(f'DynamoDB error: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
    except Exception as e:
        print(f'Error processing request: {e}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }


def get_by_id(table, inquiry_id):
    """ID指定で単一問い合わせを取得"""
    response = table.get_item(Key={'id': inquiry_id})
    item = response.get('Item')

    if not item:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Inquiry not found'})
        }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(item, ensure_ascii=False)
    }


def get_by_mail_address(table, mail_address):
    """メールアドレスで問い合わせ一覧を取得 (GSI使用)"""
    response = table.query(
        IndexName='mailAddress-index',
        KeyConditionExpression=Key('mailAddress').eq(mail_address)
    )

    items = response.get('Items', [])

    # ページネーション対応（大量データ時）
    while 'LastEvaluatedKey' in response:
        response = table.query(
            IndexName='mailAddress-index',
            KeyConditionExpression=Key('mailAddress').eq(mail_address),
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        items.extend(response.get('Items', []))

    # createdDateで降順ソート（新しい順）
    items.sort(key=lambda x: x.get('createdDate', ''), reverse=True)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'items': items,
            'count': len(items)
        }, ensure_ascii=False)
    }
