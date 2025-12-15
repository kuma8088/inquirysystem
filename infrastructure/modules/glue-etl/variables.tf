variable "job_name" {
  description = "Name of the Glue job"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the source DynamoDB table"
  type        = string
}

variable "dynamodb_arn" {
  description = "ARN of the source DynamoDB table"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for output"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for output"
  type        = string
}

variable "glue_script_path" {
  description = "Local path to the Glue script file"
  type        = string
}

variable "database_name" {
  description = "Name of the Glue catalog database"
  type        = string
  default     = "inquiry_analytics"
}

variable "table_name" {
  description = "Name of the Glue catalog table"
  type        = string
  default     = "inquiry"
}
