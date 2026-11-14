<script setup lang="ts">
import { UtilDate } from '#components'

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const { stats: traffic, failed: trafficFailed } = useUmamiStats()

// 响应头不正确时，stats.value 可能会是字符串，首次属性访问可能为 undefined
const { data: stats } = useFetch('/api/stats')

const yearlyTip = computed(() => Object
	.entries(stats.value?.annual || {})
	.reverse()
	.map(([year, item]) => `${year}年：${item.posts}篇，${formatNumber(item.words)}字`)
	.join('\n') || '数据获取失败',
)

function trafficTip(metric: 'visitors' | 'pageviews', label: string) {
	return computed(() => traffic.value
		? `${label}：${traffic.value[metric].toLocaleString('zh-CN')}（Umami 累计统计）`
		: trafficFailed.value ? '访问统计暂时不可用' : '正在加载访问统计',
	)
}

const overviewStats = [{
	label: appConfig.stats.includePaths.length ? '文章字数' : '总字数',
	value: computed(() => formatNumber(stats.value?.total?.words) || '--'),
	tip: yearlyTip,
}, ...appConfig.umami.shareUrl
	? [{
			label: '总访客数',
			value: computed(() => formatNumber(traffic.value?.visitors) || '--'),
			tip: trafficTip('visitors', '总访客数'),
		}, {
			label: '总访问量',
			value: computed(() => formatNumber(traffic.value?.pageviews) || '--'),
			tip: trafficTip('pageviews', '总访问量'),
		}]
	: []]

const runtimeStats = [{
	label: '运营时长',
	value: timeElapse(appConfig.timeEstablished),
	tip: `博客于${appConfig.timeEstablished}上线`,
}, {
	label: '上次更新',
	value: () => h(UtilDate, {
		date: runtimeConfig.public.buildTime,
		relative: true,
		tipPrefix: '构建于',
	}),
}]
</script>

<template>
<BlogWidget card title="博客统计">
	<ZDlGroup
		:items="overviewStats"
		size="small"
		:aria-busy="!!appConfig.umami.shareUrl && !traffic && !trafficFailed"
	/>
	<ZDlGroup class="runtime-stats" :items="runtimeStats" size="small" />
</BlogWidget>
</template>

<style scoped>
.runtime-stats {
	margin-top: 0.5em;
}
</style>
