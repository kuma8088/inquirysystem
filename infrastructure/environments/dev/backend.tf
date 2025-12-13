# Uncomment and configure after creating the S3 bucket and DynamoDB table for state management
# terraform {
#   backend "s3" {
#     bucket         = "inquiry-system-tfstate"
#     key            = "env/dev/terraform.tfstate"
#     region         = "ap-northeast-1"
#     encrypt        = true
#     dynamodb_table = "terraform-lock"
#   }
# }
