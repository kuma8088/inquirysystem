terraform {
  backend "s3" {
    bucket         = "inquiry-system-tfstate-552927148143"
    key            = "env/dev/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}
