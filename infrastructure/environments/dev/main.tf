terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    Owner       = var.owner
    ManagedBy   = "terraform"
  }
}

# DynamoDB Table
module "dynamodb" {
  source = "../../modules/dynamodb"

  table_name  = var.dynamodb_table_name
  environment = var.environment
}

# Lambda Function
module "lambda" {
  source = "../../modules/lambda"

  function_name    = var.lambda_function_name
  environment      = var.environment
  dynamodb_table   = module.dynamodb.table_name
  dynamodb_arn     = module.dynamodb.table_arn
  source_code_path = var.lambda_source_path
}

# API Gateway
module "api_gateway" {
  source = "../../modules/api-gateway"

  api_name            = var.api_name
  environment         = var.environment
  lambda_function_arn = module.lambda.function_arn
  lambda_invoke_arn   = module.lambda.invoke_arn
}
