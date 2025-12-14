variable "bucket_name" {
  description = "Name of the S3 bucket for RAG data"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "rag_data_path" {
  description = "Path to RAG data file"
  type        = string
}
