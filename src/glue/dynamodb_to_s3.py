"""
Glue ETL Job: DynamoDB to S3 (Parquet)
DynamoDBのデータをS3にParquet形式でエクスポートする
"""
import sys
from datetime import datetime

from awsglue.context import GlueContext
from awsglue.dynamicframe import DynamicFrame
from awsglue.job import Job
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from pyspark.sql.functions import col, lit

# ジョブ引数を取得
args = getResolvedOptions(
    sys.argv,
    ["JOB_NAME", "DYNAMODB_TABLE", "S3_OUTPUT_PATH", "GLUE_DATABASE", "GLUE_TABLE"],
)

# Spark/Glueコンテキストの初期化
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# 引数から設定を取得
dynamodb_table = args["DYNAMODB_TABLE"]
s3_output_path = args["S3_OUTPUT_PATH"]
glue_database = args["GLUE_DATABASE"]
glue_table = args["GLUE_TABLE"]

# 現在の日時をパーティションキーとして使用
now = datetime.utcnow()
year = now.strftime("%Y")
month = now.strftime("%m")
day = now.strftime("%d")

print(f"Starting ETL job for table: {dynamodb_table}")
print(f"Output path: {s3_output_path}")
print(f"Partition: year={year}/month={month}/day={day}")

# DynamoDBからデータを読み込み
# throughput.read.percent=0.5 で本番への負荷を50%に制限
dynamodb_dyf = glueContext.create_dynamic_frame.from_options(
    connection_type="dynamodb",
    connection_options={
        "dynamodb.input.tableName": dynamodb_table,
        "dynamodb.throughput.read.percent": "0.5",
    },
)

print(f"Records read from DynamoDB: {dynamodb_dyf.count()}")

# データが空の場合は終了
if dynamodb_dyf.count() == 0:
    print("No records found in DynamoDB table. Exiting.")
    job.commit()
    sys.exit(0)

# DynamicFrameをDataFrameに変換
df = dynamodb_dyf.toDF()

# カラム名をsnake_caseに変換し、必要なカラムのみ選択
# DynamoDB属性名 → Athenaカラム名
column_mapping = {
    "id": "id",
    "reviewText": "review_text",
    "userName": "user_name",
    "mailAddress": "mail_address",
    "createdDate": "created_date",
    "Category": "category",
    "answer": "answer",
}

# 存在するカラムのみ選択・リネーム
existing_columns = df.columns
selected_columns = []
for dynamo_col, athena_col in column_mapping.items():
    if dynamo_col in existing_columns:
        selected_columns.append(col(dynamo_col).alias(athena_col))

df_transformed = df.select(selected_columns)

# エクスポート日時を追加
df_transformed = df_transformed.withColumn("exported_at", lit(now.isoformat()))

# パーティションカラムを追加
df_transformed = df_transformed.withColumn("year", lit(year))
df_transformed = df_transformed.withColumn("month", lit(month))
df_transformed = df_transformed.withColumn("day", lit(day))

print(f"Transformed schema: {df_transformed.schema}")
print(f"Records to write: {df_transformed.count()}")

# DataFrameをDynamicFrameに変換
output_dyf = DynamicFrame.fromDF(df_transformed, glueContext, "output")

# S3にParquet形式で書き込み（パーティション付き）
glueContext.write_dynamic_frame.from_options(
    frame=output_dyf,
    connection_type="s3",
    connection_options={
        "path": s3_output_path,
        "partitionKeys": ["year", "month", "day"],
    },
    format="parquet",
    format_options={"compression": "snappy"},
)

print(f"Successfully exported data to {s3_output_path}")

# Glue Data Catalogのパーティションを更新
# Note: 新しいパーティションは自動的にMSCK REPAIR TABLEまたは
#       Athenaのクエリ時に認識される

job.commit()
print("Job completed successfully")
