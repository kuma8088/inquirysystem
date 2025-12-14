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
