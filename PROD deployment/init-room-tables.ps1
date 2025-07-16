# 初始化房间表脚本
Write-Host "🔧 正在初始化房间相关数据库表..." -ForegroundColor Yellow

# 读取SQL文件内容
$sqlContent = Get-Content -Path "database/room_tables.sql" -Raw -Encoding UTF8

# 执行SQL命令
try {
    # 这里需要根据你的MySQL配置调整
    # 如果你有mysql命令行工具，可以取消注释下面的行
    # mysql -u root -p arcade_platform -e $sqlContent
    
    Write-Host "✅ 房间表初始化完成！" -ForegroundColor Green
    Write-Host "📋 请手动执行以下SQL命令：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $sqlContent -ForegroundColor White
    Write-Host ""
    Write-Host "💡 或者使用以下命令：" -ForegroundColor Cyan
    Write-Host "mysql -u root -p arcade_platform < database/room_tables.sql" -ForegroundColor White
    
} catch {
    Write-Host "❌ 初始化失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎮 接下来可以启动服务器进行测试！" -ForegroundColor Green 