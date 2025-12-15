# Glue用IAMロール
data "aws_iam_policy_document" "glue_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["glue.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "glue" {
  name               = "${var.job_name}-${var.environment}-role"
  assume_role_policy = data.aws_iam_policy_document.glue_assume_role.json

  tags = {
    Name        = "${var.job_name}-${var.environment}-role"
    Environment = var.environment
  }
}

data "aws_iam_policy_document" "glue_policy" {
  # CloudWatch Logs
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:/aws-glue/*"]
  }

  # DynamoDB読み取り
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:DescribeTable",
      "dynamodb:Scan",
      "dynamodb:GetItem"
    ]
    resources = [var.dynamodb_arn]
  }

  # S3読み書き
  statement {
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = [
      var.s3_bucket_arn,
      "${var.s3_bucket_arn}/*"
    ]
  }

  # Glue Catalog
  statement {
    effect = "Allow"
    actions = [
      "glue:GetDatabase",
      "glue:GetTable",
      "glue:UpdateTable",
      "glue:CreateTable",
      "glue:GetPartition",
      "glue:BatchCreatePartition",
      "glue:GetPartitions"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "glue" {
  name   = "${var.job_name}-${var.environment}-policy"
  role   = aws_iam_role.glue.id
  policy = data.aws_iam_policy_document.glue_policy.json
}

resource "aws_iam_role_policy_attachment" "glue_service" {
  role       = aws_iam_role.glue.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

# Glueスクリプトを格納するS3オブジェクト
resource "aws_s3_object" "glue_script" {
  bucket       = var.s3_bucket_name
  key          = "glue-scripts/dynamodb_to_s3.py"
  source       = var.glue_script_path
  etag         = filemd5(var.glue_script_path)
  content_type = "text/x-python"
}

# Glue Database
resource "aws_glue_catalog_database" "inquiry" {
  name = "${var.database_name}_${var.environment}"
}

# Glue Table (Parquet形式のスキーマ定義)
resource "aws_glue_catalog_table" "inquiry" {
  name          = var.table_name
  database_name = aws_glue_catalog_database.inquiry.name

  table_type = "EXTERNAL_TABLE"

  parameters = {
    "classification"   = "parquet"
    "parquet.compress" = "SNAPPY"
  }

  storage_descriptor {
    location      = "s3://${var.s3_bucket_name}/glue-output/inquiry/"
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
      parameters = {
        "serialization.format" = "1"
      }
    }

    columns {
      name = "id"
      type = "string"
    }
    columns {
      name = "review_text"
      type = "string"
    }
    columns {
      name = "user_name"
      type = "string"
    }
    columns {
      name = "mail_address"
      type = "string"
    }
    columns {
      name = "created_date"
      type = "string"
    }
    columns {
      name = "category"
      type = "string"
    }
    columns {
      name = "answer"
      type = "string"
    }
    columns {
      name = "exported_at"
      type = "string"
    }
  }

  partition_keys {
    name = "year"
    type = "string"
  }
  partition_keys {
    name = "month"
    type = "string"
  }
  partition_keys {
    name = "day"
    type = "string"
  }
}

# Glue Job
resource "aws_glue_job" "dynamodb_to_s3" {
  name     = "${var.job_name}-${var.environment}"
  role_arn = aws_iam_role.glue.arn

  command {
    name            = "glueetl"
    script_location = "s3://${var.s3_bucket_name}/glue-scripts/dynamodb_to_s3.py"
    python_version  = "3"
  }

  # コスト最適化: 最小DPU設定
  number_of_workers = 2
  worker_type       = "G.1X"
  glue_version      = "4.0"
  timeout           = 60

  default_arguments = {
    "--job-language"                     = "python"
    "--enable-continuous-cloudwatch-log" = "true"
    "--enable-metrics"                   = "true"
    "--enable-spark-ui"                  = "false"
    "--TempDir"                          = "s3://${var.s3_bucket_name}/glue-temp/"
    "--DYNAMODB_TABLE"                   = var.dynamodb_table_name
    "--S3_OUTPUT_PATH"                   = "s3://${var.s3_bucket_name}/glue-output/inquiry/"
    "--GLUE_DATABASE"                    = aws_glue_catalog_database.inquiry.name
    "--GLUE_TABLE"                       = var.table_name
  }

  execution_property {
    max_concurrent_runs = 1
  }

  tags = {
    Name        = "${var.job_name}-${var.environment}"
    Environment = var.environment
  }

  depends_on = [aws_s3_object.glue_script]
}
