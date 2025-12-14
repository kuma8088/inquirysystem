variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "dynamodb_table" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "dynamodb_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for aggregation results"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for aggregation results"
  type        = string
}

variable "source_code_path" {
  description = "Path to Lambda source code"
  type        = string
}
