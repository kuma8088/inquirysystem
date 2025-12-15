variable "workgroup_name" {
  description = "Name of the Athena workgroup"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for Athena results"
  type        = string
}

variable "glue_database_name" {
  description = "Name of the Glue catalog database"
  type        = string
}

variable "glue_table_name" {
  description = "Name of the Glue catalog table"
  type        = string
}

variable "bytes_scanned_cutoff" {
  description = "Maximum bytes scanned per query (cost control)"
  type        = number
  default     = 10737418240 # 10GB
}
