import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# OpenAI 兼容接口 (用于 AI 打标、语义搜索、遗忘唤醒)
# 可直连 OpenAI，也可指向 DeepSeek 等兼容服务：
#   OPENAI_BASE_URL=https://api.deepseek.com
#   OPENAI_MODEL=deepseek-chat
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# 允许跨域的前端来源（逗号分隔）
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,https://karyophilic.github.io",
    ).split(",")
    if o.strip()
]

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "lingjing-dev-secret-change-in-production")

# 遗忘唤醒配置
WAKEUP_DELAY_HOURS = 72  # 灵感创建后 72 小时发送唤醒提醒
