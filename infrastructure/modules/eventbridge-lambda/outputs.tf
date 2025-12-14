output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.daily_aggregation.arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.daily_aggregation.function_name
}

output "event_rule_arn" {
  description = "ARN of the EventBridge rule"
  value       = aws_cloudwatch_event_rule.daily_schedule.arn
}
