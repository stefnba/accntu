from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CloudStorageSettings(BaseSettings):
    bucket_name: str = Field(alias="AWS_BUCKET_NAME_PRIVATE_UPLOAD", default="")
    region: str = Field(alias="AWS_BUCKET_REGION", default="")
    access_key: str = Field(alias="AWS_ACCESS_KEY", default="")
    secret_key: str = Field(
        alias="AWS_SECRET_ACCESS_KEY",
        default="",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class Settings(BaseSettings):
    app_name: str = "accntu Parsing API"
    cloud_storage: CloudStorageSettings = CloudStorageSettings()
    db_url: str = Field(alias="DATABASE_URL", default=None)


settings = Settings()
