output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.dynamodb.table_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda.function_name
}

output "rag_bucket_name" {
  description = "S3 bucket name for RAG data"
  value       = module.s3_rag.bucket_name
}

output "create_answer_function_name" {
  description = "CreateAnswer Lambda function name"
  value       = module.lambda_create_answer.function_name
}

output "judge_category_function_name" {
  description = "JudgeCategory Lambda function name"
  value       = module.lambda_judge_category.function_name
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.sqs.queue_url
}

output "state_machine_arn" {
  description = "Step Functions state machine ARN"
  value       = module.step_functions.state_machine_arn
}

output "execute_job_function_name" {
  description = "ExecuteJob Lambda function name"
  value       = module.lambda_execute_job.function_name
}

output "send_email_function_name" {
  description = "SendEmail Lambda function name"
  value       = module.lambda_send_email.function_name
}

output "aggregation_bucket_name" {
  description = "S3 bucket name for aggregation results"
  value       = module.s3_aggregation.bucket_name
}

output "daily_aggregation_function_name" {
  description = "DailyAggregation Lambda function name"
  value       = module.lambda_daily_aggregation.function_name
}

output "analytics_bucket_name" {
  description = "S3 bucket name for analytics data"
  value       = module.s3_analytics.bucket_name
}

output "glue_job_name" {
  description = "Glue ETL job name"
  value       = module.glue_etl.job_name
}

output "glue_database_name" {
  description = "Glue catalog database name"
  value       = module.glue_etl.database_name
}

output "athena_workgroup_name" {
  description = "Athena workgroup name"
  value       = module.athena.workgroup_name
}
