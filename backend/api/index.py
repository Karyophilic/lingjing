"""Vercel Serverless 入口。

Vercel 的 Python 运行时会把导出的 ASGI 应用 `app` 直接当函数处理，
所以这里只需要把 backend 目录加入 sys.path 后导入 FastAPI 实例。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402,F401
