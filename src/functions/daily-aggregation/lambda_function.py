import json
import os
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', '')
BUCKET_NAME = os.environ.get('AGGREGATION_BUCKET', '')

JST = timezone(timedelta(hours=9))


def handler(event, context):
    try:
        # 昨日の日付を取得（JST）
        yesterday = datetime.now(JST) - timedelta(days=1)
        target_date = yesterday.strftime('%Y-%m-%d')

        print(f'Aggregating data for date: {target_date}')

        # DynamoDB GSI でデータを取得
        table = dynamodb.Table(TABLE_NAME)
        response = table.query(
            IndexName='createdDate-index',
            KeyConditionExpression='createdDate = :date',
            ExpressionAttributeValues={
                ':date': target_date
            }
        )

        items = response.get('Items', [])
        print(f'Found {len(items)} items for {target_date}')

        # ページネーション対応
        while 'LastEvaluatedKey' in response:
            response = table.query(
                IndexName='createdDate-index',
                KeyConditionExpression='createdDate = :date',
                ExpressionAttributeValues={
                    ':date': target_date
                },
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))

        # Category ごとに集計
        category_counts = defaultdict(int)
        for item in items:
            category = item.get('category', 'unknown')
            category_counts[category] += 1

        # 集計結果を作成
        aggregation_result = {
            'date': target_date,
            'total_count': len(items),
            'category_breakdown': dict(category_counts),
            'aggregated_at': datetime.now(JST).isoformat()
        }

        print(f'Aggregation result: {json.dumps(aggregation_result, ensure_ascii=False)}')

        # S3 に保存
        s3_key = f'aggregations/{target_date}.json'
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json.dumps(aggregation_result, ensure_ascii=False, indent=2),
            ContentType='application/json'
        )

        print(f'Saved aggregation to s3://{BUCKET_NAME}/{s3_key}')

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Aggregation completed successfully',
                'date': target_date,
                'total_count': len(items),
                's3_key': s3_key
            })
        }

    except ClientError as e:
        print(f'AWS error: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'AWS service error'})
        }
    except Exception as e:
        print(f'Error during aggregation: {e}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
