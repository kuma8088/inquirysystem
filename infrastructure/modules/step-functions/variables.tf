variable "state_machine_name" {
  description = "Name of the Step Functions state machine"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "judge_category_arn" {
  description = "ARN of JudgeCategory Lambda"
  type        = string
}

variable "create_answer_arn" {
  description = "ARN of CreateAnswer Lambda"
  type        = string
}

variable "send_email_arn" {
  description = "ARN of SendEmail Lambda"
  type        = string
}
