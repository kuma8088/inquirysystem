output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.bedrock.arn
}

output "invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.bedrock.invoke_arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.bedrock.function_name
}
