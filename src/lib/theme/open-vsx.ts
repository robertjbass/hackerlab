export type OpenVSXExtension = {
  name: string
  namespace: string
  displayName: string
  description: string
  version: string
  downloadCount: number
  averageRating: number | null
  files: { download: string; icon?: string }
}

type OpenVSXSearchResponse = {
  offset: number
  totalSize: number
  extensions: Array<{
    name: string
    namespace: string
    displayName?: string
    description?: string
    version: string
    downloadCount?: number
    averageRating?: number
    files?: Record<string, string>
  }>
}

export type SearchResult = {
  results: OpenVSXExtension[]
  totalSize: number
}

export async function searchOpenVSX(
  query: string,
  options?: { offset?: number; size?: number },
): Promise<SearchResult> {
  const size = options?.size ?? 12
  const offset = options?.offset ?? 0

  const params = new URLSearchParams({
    query,
    category: 'Themes',
    size: String(size),
    offset: String(offset),
    sortBy: 'downloadCount',
    sortOrder: 'desc',
  })

  const response = await fetch(
    `https://open-vsx.org/api/-/search?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error(`Open VSX search failed: ${response.status}`)
  }

  const data = (await response.json()) as OpenVSXSearchResponse

  const results: OpenVSXExtension[] = data.extensions.map((ext) => ({
    name: ext.name,
    namespace: ext.namespace,
    displayName: ext.displayName || ext.name,
    description: ext.description || '',
    version: ext.version,
    downloadCount: ext.downloadCount ?? 0,
    averageRating: ext.averageRating ?? null,
    files: {
      download: ext.files?.download ?? '',
      icon: ext.files?.icon,
    },
  }))

  return { results, totalSize: data.totalSize }
}
