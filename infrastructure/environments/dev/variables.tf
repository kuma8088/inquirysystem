variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_source_path" {
  description = "Path to Lambda source code"
  type        = string
}

variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "rag_bucket_name" {
  description = "Name of the S3 bucket for RAG data"
  type        = string
}

variable "rag_data_path" {
  description = "Path to RAG data file"
  type        = string
}

variable "create_answer_function_name" {
  description = "Name of the CreateAnswer Lambda function"
  type        = string
}

variable "create_answer_source_path" {
  description = "Path to CreateAnswer Lambda source code"
  type        = string
}

variable "judge_category_function_name" {
  description = "Name of the JudgeCategory Lambda function"
  type        = string
}

variable "judge_category_source_path" {
  description = "Path to JudgeCategory Lambda source code"
  type        = string
}

variable "bedrock_model_id" {
  description = "Bedrock model ID"
  type        = string
  default     = "amazon.nova-micro-v1:0"
}

# SQS
variable "sqs_queue_name" {
  description = "Name of the SQS queue"
  type        = string
}

# SES
variable "ses_email" {
  description = "SES email address"
  type        = string
}

# Step Functions
variable "state_machine_name" {
  description = "Name of the Step Functions state machine"
  type        = string
}

# ExecuteJob Lambda
variable "execute_job_function_name" {
  description = "Name of the ExecuteJob Lambda function"
  type        = string
}

variable "execute_job_source_path" {
  description = "Path to ExecuteJob Lambda source code"
  type        = string
}

# SendEmail Lambda
variable "send_email_function_name" {
  description = "Name of the SendEmail Lambda function"
  type        = string
}

variable "send_email_source_path" {
  description = "Path to SendEmail Lambda source code"
  type        = string
}

# S3 Aggregation
variable "aggregation_bucket_name" {
  description = "Name of the S3 bucket for aggregation results"
  type        = string
}

# DailyAggregation Lambda
variable "daily_aggregation_function_name" {
  description = "Name of the DailyAggregation Lambda function"
  type        = string
}

variable "daily_aggregation_source_path" {
  description = "Path to DailyAggregation Lambda source code"
  type        = string
}
