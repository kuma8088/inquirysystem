variable "bucket_name" {
  description = "Name of the S3 bucket for analytics data"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "data_retention_days" {
  description = "Number of days to retain data before deletion"
  type        = number
  default     = 30
}
