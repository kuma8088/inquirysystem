resource "aws_s3_bucket" "analytics" {
  bucket = "${var.bucket_name}-${var.environment}"

  tags = {
    Name        = "${var.bucket_name}-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "analytics" {
  bucket = aws_s3_bucket.analytics.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  rule {
    id     = "expire-old-data"
    status = "Enabled"

    expiration {
      days = var.data_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}
