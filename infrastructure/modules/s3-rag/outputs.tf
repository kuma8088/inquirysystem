output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.rag.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.rag.arn
}

output "hotel_info_key" {
  description = "S3 key for hotel info file"
  value       = aws_s3_object.hotel_info.key
}
