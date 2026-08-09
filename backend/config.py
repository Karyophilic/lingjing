import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# OpenAI (用于 AI 打标、语义搜索、遗忘唤醒)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-3-small"

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "lingjing-dev-secret-change-in-production")

# 遗忘唤醒配置
WAKEUP_DELAY_HOURS = 72  # 灵感创建后 72 小时发送唤醒提醒
