import json
import os
import boto3
from botocore.exceptions import ClientError

sfn = boto3.client('stepfunctions')

STATE_MACHINE_ARN = os.environ.get('STATE_MACHINE_ARN', '')


def handler(event, context):
    """
    SQS からメッセージを受信し、Step Functions を実行する
    """
    try:
        for record in event.get('Records', []):
            body = json.loads(record['body'])
            inquiry_id = body.get('id')

            if not inquiry_id:
                print(f'Error: id is missing in message body: {body}')
                continue

            response = sfn.start_execution(
                stateMachineArn=STATE_MACHINE_ARN,
                input=json.dumps({'id': inquiry_id})
            )

            print(f'Started execution: {response["executionArn"]} for id: {inquiry_id}')

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Execution started successfully'})
        }

    except ClientError as e:
        print(f'AWS error: {e}')
        raise e
    except Exception as e:
        print(f'Error: {e}')
        raise e
