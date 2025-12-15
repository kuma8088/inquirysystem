environment          = "dev"
project_name         = "inquiry-system"
owner                = "naoya"
dynamodb_table_name  = "inquiry-table-dev"
lambda_function_name = "upload-inquiry-dev"
lambda_source_path   = "../../../src/functions/upload-inquiry"
api_name             = "inquiry-api-dev"

# Bedrock RAG
rag_bucket_name              = "inquiry-rag-data"
rag_data_path                = "../../../src/rag-data/hotel_info.json"
create_answer_function_name  = "create-answer-dev"
create_answer_source_path    = "../../../src/functions/create-answer"
judge_category_function_name = "judge-category-dev"
judge_category_source_path   = "../../../src/functions/judge-category"
bedrock_model_id             = "apac.amazon.nova-micro-v1:0"

# SQS
sqs_queue_name = "inquiry-queue-dev"

# SES (このファイルは.gitignoreに追加済み)
ses_email = "naoya.iimura@gmail.com"

# Step Functions
state_machine_name = "inquiry-workflow-dev"

# ExecuteJob Lambda
execute_job_function_name = "execute-job-dev"
execute_job_source_path   = "../../../src/functions/execute-job"

# SendEmail Lambda
send_email_function_name = "send-email-dev"
send_email_source_path   = "../../../src/functions/send-email"

# S3 Aggregation
aggregation_bucket_name = "inquiry-aggregation"

# DailyAggregation Lambda
daily_aggregation_function_name = "daily-aggregation-dev"
daily_aggregation_source_path   = "../../../src/functions/daily-aggregation"

# Analytics (Glue + Athena)
analytics_bucket_name = "inquiry-analytics"
glue_job_name         = "dynamodb-to-s3-etl"
glue_script_path      = "../../../src/glue/dynamodb_to_s3.py"
athena_workgroup_name = "inquiry-analytics"
