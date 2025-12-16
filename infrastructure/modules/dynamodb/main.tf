resource "aws_dynamodb_table" "inquiry" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "createdDate"
    type = "S"
  }

  attribute {
    name = "mailAddress"
    type = "S"
  }

  global_secondary_index {
    name            = "createdDate-index"
    hash_key        = "createdDate"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "mailAddress-index"
    hash_key        = "mailAddress"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name        = var.table_name
    Environment = var.environment
  }
}
