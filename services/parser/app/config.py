from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CloudStorageSettings(BaseSettings):
    bucket_name: str = Field(alias="AWS_BUCKET_NAME", default="")
    region: str = Field(alias="AWS_BUCKET_REGION", default="")
    access_key: str = Field(alias="AWS_ACCESS_KEY", default="")
    secret_key: str = Field(
        alias="AWS_SECRET_ACCESS_KEY",
        default="",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class Settings(BaseSettings):
    app_name: str = "Awesome API"
    cloud_storage: CloudStorageSettings = CloudStorageSettings()

    # model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
