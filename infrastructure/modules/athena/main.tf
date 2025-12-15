# Athena Workgroup
resource "aws_athena_workgroup" "inquiry" {
  name = "${var.workgroup_name}-${var.environment}"

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${var.s3_bucket_name}/athena-results/"

      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }

    # コスト制御: スキャンデータ量の上限
    bytes_scanned_cutoff_per_query = var.bytes_scanned_cutoff
  }

  tags = {
    Name        = "${var.workgroup_name}-${var.environment}"
    Environment = var.environment
  }
}

# Named Query: カテゴリ別集計
resource "aws_athena_named_query" "category_summary" {
  name        = "category-summary"
  workgroup   = aws_athena_workgroup.inquiry.name
  database    = var.glue_database_name
  description = "カテゴリ別問い合わせ件数の集計"

  query = <<-EOT
    SELECT
      category,
      COUNT(*) as count
    FROM ${var.glue_table_name}
    GROUP BY category
    ORDER BY count DESC
  EOT
}

# Named Query: 日別推移
resource "aws_athena_named_query" "daily_trend" {
  name        = "daily-trend"
  workgroup   = aws_athena_workgroup.inquiry.name
  database    = var.glue_database_name
  description = "日別問い合わせ件数の推移"

  query = <<-EOT
    SELECT
      year,
      month,
      day,
      COUNT(*) as count
    FROM ${var.glue_table_name}
    GROUP BY year, month, day
    ORDER BY year, month, day
  EOT
}

# Named Query: 全データ取得
resource "aws_athena_named_query" "all_data" {
  name        = "all-data"
  workgroup   = aws_athena_workgroup.inquiry.name
  database    = var.glue_database_name
  description = "全問い合わせデータの取得"

  query = <<-EOT
    SELECT
      id,
      review_text,
      user_name,
      mail_address,
      created_date,
      category,
      answer,
      exported_at
    FROM ${var.glue_table_name}
    ORDER BY created_date DESC
    LIMIT 100
  EOT
}
