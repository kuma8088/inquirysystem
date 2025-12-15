output "workgroup_name" {
  description = "Name of the Athena workgroup"
  value       = aws_athena_workgroup.inquiry.name
}

output "workgroup_arn" {
  description = "ARN of the Athena workgroup"
  value       = aws_athena_workgroup.inquiry.arn
}
