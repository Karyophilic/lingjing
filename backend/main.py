from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, inspirations, ai

app = FastAPI(
    title="灵境 API",
    description="灵感社交平台后端 — AI驱动的灵感记录与社交匹配",
    version="0.1.0",
)

# CORS 配置（允许前端跨域）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(inspirations.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"name": "灵境 API", "version": "0.1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
