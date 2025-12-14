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

# S3 RAG Data Bucket
module "s3_rag" {
  source = "../../modules/s3-rag"

  bucket_name   = var.rag_bucket_name
  environment   = var.environment
  rag_data_path = var.rag_data_path
}

# CreateAnswer Lambda
module "lambda_create_answer" {
  source = "../../modules/lambda-bedrock"

  function_name    = var.create_answer_function_name
  environment      = var.environment
  aws_region       = var.aws_region
  dynamodb_arn     = module.dynamodb.table_arn
  s3_bucket_arn    = module.s3_rag.bucket_arn
  source_code_path = var.create_answer_source_path
  timeout          = 120
  memory_size      = 256
  bedrock_model_id = var.bedrock_model_id

  environment_variables = {
    DYNAMODB_TABLE = module.dynamodb.table_name
    S3_BUCKET      = module.s3_rag.bucket_name
    RAG_KEY        = module.s3_rag.hotel_info_key
    MODEL_ID       = var.bedrock_model_id
  }
}

# JudgeCategory Lambda
module "lambda_judge_category" {
  source = "../../modules/lambda-bedrock"

  function_name    = var.judge_category_function_name
  environment      = var.environment
  aws_region       = var.aws_region
  dynamodb_arn     = module.dynamodb.table_arn
  s3_bucket_arn    = ""
  source_code_path = var.judge_category_source_path
  timeout          = 60
  memory_size      = 256
  bedrock_model_id = var.bedrock_model_id

  environment_variables = {
    DYNAMODB_TABLE = module.dynamodb.table_name
    MODEL_ID       = var.bedrock_model_id
  }
}
