output "job_name" {
  description = "Name of the Glue job"
  value       = aws_glue_job.dynamodb_to_s3.name
}

output "job_arn" {
  description = "ARN of the Glue job"
  value       = aws_glue_job.dynamodb_to_s3.arn
}

output "role_arn" {
  description = "ARN of the Glue IAM role"
  value       = aws_iam_role.glue.arn
}

output "database_name" {
  description = "Name of the Glue catalog database"
  value       = aws_glue_catalog_database.inquiry.name
}

output "table_name" {
  description = "Name of the Glue catalog table"
  value       = aws_glue_catalog_table.inquiry.name
}
