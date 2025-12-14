resource "aws_s3_bucket" "rag" {
  bucket = "${var.bucket_name}-${var.environment}"

  tags = {
    Name        = "${var.bucket_name}-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "rag" {
  bucket = aws_s3_bucket.rag.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rag" {
  bucket = aws_s3_bucket.rag.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "rag" {
  bucket = aws_s3_bucket.rag.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "hotel_info" {
  bucket       = aws_s3_bucket.rag.id
  key          = "hotel_info.json"
  source       = var.rag_data_path
  etag         = filemd5(var.rag_data_path)
  content_type = "application/json"
}
