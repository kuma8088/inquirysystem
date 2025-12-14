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

# SQS Queue
module "sqs" {
  source = "../../modules/sqs"

  queue_name  = var.sqs_queue_name
  environment = var.environment
}

# Lambda Function (upload-inquiry)
module "lambda" {
  source = "../../modules/lambda"

  function_name    = var.lambda_function_name
  environment      = var.environment
  dynamodb_table   = module.dynamodb.table_name
  dynamodb_arn     = module.dynamodb.table_arn
  source_code_path = var.lambda_source_path
  sqs_queue_arn    = module.sqs.queue_arn
  sqs_queue_url    = module.sqs.queue_url
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

# SES Email Identity
module "ses" {
  source = "../../modules/ses"

  email_address = var.ses_email
}

# S3 Aggregation Bucket
module "s3_aggregation" {
  source = "../../modules/s3-aggregation"

  bucket_name = var.aggregation_bucket_name
  environment = var.environment
}

# SendEmail Lambda
module "lambda_send_email" {
  source = "../../modules/lambda-ses"

  function_name    = var.send_email_function_name
  environment      = var.environment
  dynamodb_table   = module.dynamodb.table_name
  dynamodb_arn     = module.dynamodb.table_arn
  sender_email     = var.ses_email
  source_code_path = var.send_email_source_path
}

# Step Functions State Machine
module "step_functions" {
  source = "../../modules/step-functions"

  state_machine_name = var.state_machine_name
  environment        = var.environment
  judge_category_arn = module.lambda_judge_category.function_arn
  create_answer_arn  = module.lambda_create_answer.function_arn
  send_email_arn     = module.lambda_send_email.function_arn
}

# ExecuteJob Lambda (SQS -> Step Functions)
module "lambda_execute_job" {
  source = "../../modules/lambda-sqs-sfn"

  function_name     = var.execute_job_function_name
  environment       = var.environment
  sqs_queue_arn     = module.sqs.queue_arn
  state_machine_arn = module.step_functions.state_machine_arn
  source_code_path  = var.execute_job_source_path
}

# DailyAggregation Lambda (EventBridge -> Lambda -> S3)
module "lambda_daily_aggregation" {
  source = "../../modules/eventbridge-lambda"

  function_name    = var.daily_aggregation_function_name
  environment      = var.environment
  dynamodb_table   = module.dynamodb.table_name
  dynamodb_arn     = module.dynamodb.table_arn
  s3_bucket_name   = module.s3_aggregation.bucket_name
  s3_bucket_arn    = module.s3_aggregation.bucket_arn
  source_code_path = var.daily_aggregation_source_path
}
