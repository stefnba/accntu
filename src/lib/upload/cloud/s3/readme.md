
# Upload files client-side to S3

Inspired by [this great post](https://www.nexttonone.lol/upload-s3#upload-to-s3).


## Bucket Permissions

You only need to make it public if you're doing client side put and get, if you want to keep your bucket private, use [these instructions](https://www.sammeechward.com/storing-images-in-s3-from-node-server) instead.

- Click on "Permissions"
- Click on "Bucket Policy"
- Paste in the following policy, replacing `BUCKET_NAME` with the name of your bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::BUCKET_NAME/*"]
    }
  ]
}

```

## Bucket CORS Configuration

-Click on "Permissions"
-Click on "CORS configuration"
-Paste in the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

## Create an IAM User

- Go to the AWS Console and search for "IAM"
- Click on "Users" in the left sidebar and then "Add user"
- Enter a username, e.g. next-s3-upload
- People will tell you to use "AmazonS3FullAccess", but don't make a new policy and attach it
- Past the following config and replace `BUCKET_NAME` with the name of your bucket

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}

```

## Set Environment Eariables

Copy the access key and secret key as environment variables

```env
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_BUCKET_REGION=
```
