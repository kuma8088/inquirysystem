output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.execute_job.arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.execute_job.function_name
}
