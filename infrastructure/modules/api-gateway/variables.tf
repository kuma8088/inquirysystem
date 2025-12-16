variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "lambda_function_arn" {
  description = "ARN of the Lambda function"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  type        = string
}

variable "enable_get_lambda" {
  description = "Enable GET Lambda integration"
  type        = bool
  default     = false
}

variable "lambda_get_function_arn" {
  description = "ARN of the GET Lambda function (optional)"
  type        = string
  default     = ""
}

variable "lambda_get_invoke_arn" {
  description = "Invoke ARN of the GET Lambda function (optional)"
  type        = string
  default     = ""
}
