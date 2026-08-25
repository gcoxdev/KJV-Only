type SearchPageModule = typeof import("@/components/reader/search-page")

let searchPageModulePromise: Promise<SearchPageModule> | null = null

export function loadSearchPage() {
  searchPageModulePromise ??= import("@/components/reader/search-page").catch(
    (error) => {
      searchPageModulePromise = null
      throw error
    },
  )
  return searchPageModulePromise
}

export function preloadSearchPage() {
  void loadSearchPage()
}
