# Dead Letter Queue
resource "aws_sqs_queue" "dlq" {
  name                      = "${var.queue_name}-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name        = "${var.queue_name}-dlq"
    Environment = var.environment
  }
}

# Main Queue
resource "aws_sqs_queue" "inquiry" {
  name                       = var.queue_name
  visibility_timeout_seconds = 300   # Lambda timeout * 5
  message_retention_seconds  = 86400 # 1 day
  receive_wait_time_seconds  = 10    # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = var.queue_name
    Environment = var.environment
  }
}
