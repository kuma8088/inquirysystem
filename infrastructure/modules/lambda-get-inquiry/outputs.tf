output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.get_inquiry.arn
}

output "invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.get_inquiry.invoke_arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.get_inquiry.function_name
}
