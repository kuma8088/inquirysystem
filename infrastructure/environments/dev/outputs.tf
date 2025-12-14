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
