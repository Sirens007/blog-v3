import type { StatsResult } from 'oddmisc'

// 与 Shirone 一样，同一次站内浏览复用已完成或正在进行的查询。
const siteStatsRequests = new Map<string, Promise<StatsResult>>()

function requestSiteStats(shareUrl: string): Promise<StatsResult> {
	const existing = siteStatsRequests.get(shareUrl)
	if (existing)
		return existing

	const request = import('oddmisc')
		.then(async ({ createUmamiClient }) => {
			// oddmisc 管理内存和 localStorage 缓存：TTL 为 1 小时，查询截止时间按 5 分钟对齐。
			const client = createUmamiClient({ shareUrl })
			let stats = await client.getSiteStats()
			if (stats._fromCache && stats.pageviews === 0 && stats.visits === 0) {
				client.clearCache()
				stats = await client.getSiteStats()
			}
			return stats
		})
		.catch((error) => {
			siteStatsRequests.delete(shareUrl)
			throw error
		})

	siteStatsRequests.set(shareUrl, request)
	return request
}

/** 只在浏览器挂载后读取公开统计，兼容静态生成，不影响 Umami 原有的访问采集。 */
export function useUmamiStats() {
	const { shareUrl } = useAppConfig().umami
	const stats = useState<StatsResult | null>(`umami:site:${shareUrl}`, () => null)
	const failed = useState(`umami:failed:${shareUrl}`, () => false)

	onMounted(async () => {
		if (!shareUrl || stats.value)
			return

		failed.value = false
		try {
			stats.value = await requestSiteStats(shareUrl)
		}
		catch {
			failed.value = true
		}
	})

	return { stats: readonly(stats), failed: readonly(failed) }
}
