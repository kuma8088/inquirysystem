data "aws_iam_policy_document" "sfn_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "sfn" {
  name               = "${var.state_machine_name}-role"
  assume_role_policy = data.aws_iam_policy_document.sfn_assume_role.json
}

data "aws_iam_policy_document" "sfn_policy" {
  statement {
    effect = "Allow"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      var.judge_category_arn,
      var.create_answer_arn,
      var.send_email_arn
    ]
  }
}

resource "aws_iam_role_policy" "sfn" {
  name   = "${var.state_machine_name}-policy"
  role   = aws_iam_role.sfn.id
  policy = data.aws_iam_policy_document.sfn_policy.json
}

resource "aws_sfn_state_machine" "inquiry_workflow" {
  name     = var.state_machine_name
  role_arn = aws_iam_role.sfn.arn

  definition = jsonencode({
    Comment = "問い合わせ処理ワークフロー"
    StartAt = "JudgeCategory"
    States = {
      JudgeCategory = {
        Type     = "Task"
        Resource = var.judge_category_arn
        Parameters = {
          "id.$" = "$.id"
        }
        ResultPath = "$.judgeCategoryResult"
        Next       = "CheckIfQuestion"
      }
      CheckIfQuestion = {
        Type = "Choice"
        Choices = [
          {
            Variable      = "$.judgeCategoryResult.body"
            StringMatches = "*\"category\": \"質問\"*"
            Next          = "CreateAnswer"
          }
        ]
        Default = "SkipCreateAnswer"
      }
      CreateAnswer = {
        Type     = "Task"
        Resource = var.create_answer_arn
        Parameters = {
          "id.$" = "$.id"
        }
        ResultPath = "$.createAnswerResult"
        Next       = "SendEmail"
      }
      SendEmail = {
        Type     = "Task"
        Resource = var.send_email_arn
        Parameters = {
          "id.$" = "$.id"
        }
        End = true
      }
      SkipCreateAnswer = {
        Type = "Pass"
        End  = true
      }
    }
  })

  tags = {
    Name        = var.state_machine_name
    Environment = var.environment
  }
}
