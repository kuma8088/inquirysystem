resource "aws_apigatewayv2_api" "inquiry" {
  name          = var.api_name
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_methods = ["POST", "GET", "OPTIONS"]
    allow_origins = ["*"]
    max_age       = 300
  }

  tags = {
    Name        = var.api_name
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.inquiry.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${var.api_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.inquiry.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_inquiry" {
  api_id    = aws_apigatewayv2_api.inquiry.id
  route_key = "POST /inquiry"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.inquiry.execution_arn}/*/*"
}

# GET Lambda integration (optional)
resource "aws_apigatewayv2_integration" "lambda_get" {
  count                  = var.enable_get_lambda ? 1 : 0
  api_id                 = aws_apigatewayv2_api.inquiry.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_get_invoke_arn
  payload_format_version = "2.0"
}

# GET /inquiry/{id}
resource "aws_apigatewayv2_route" "get_inquiry_by_id" {
  count     = var.enable_get_lambda ? 1 : 0
  api_id    = aws_apigatewayv2_api.inquiry.id
  route_key = "GET /inquiry/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_get[0].id}"
}

# GET /inquiry (query parameters)
resource "aws_apigatewayv2_route" "get_inquiry" {
  count     = var.enable_get_lambda ? 1 : 0
  api_id    = aws_apigatewayv2_api.inquiry.id
  route_key = "GET /inquiry"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_get[0].id}"
}

resource "aws_lambda_permission" "api_gateway_get" {
  count         = var.enable_get_lambda ? 1 : 0
  statement_id  = "AllowAPIGatewayInvokeGet"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_get_function_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.inquiry.execution_arn}/*/*"
}
