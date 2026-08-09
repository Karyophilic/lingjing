from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_db() -> Client:
    """获取 Supabase 客户端"""
    return supabase
