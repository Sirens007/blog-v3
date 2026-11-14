<script setup lang="ts">
const blogLog = [
	{ label: '2026-11-14', value: '开始迁移至 Clarity 主题，切换到 Nuxt 4 + Nuxt Content v3' },
	{ label: '2026-09-26', value: '更换为 Shirone 主题，并启用 syrena.cn 域名' },
	{ label: '2026-02-26', value: '迁移至云服务器，启用 sirens007.cn 域名' },
	{ label: '2025-08-20', value: '基于 Mizuki 主题在 GitHub Pages 发布第一篇文章' },
]
</script>

<template>
<BlogWidget card title="更新日志">
	<ZDlGroup size="large" :items="blogLog" />
</BlogWidget>
</template>
