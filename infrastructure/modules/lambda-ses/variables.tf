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

variable "source_code_path" {
  description = "Path to Lambda source code"
  type        = string
}

variable "sender_email" {
  description = "Sender email address for SES"
  type        = string
}
