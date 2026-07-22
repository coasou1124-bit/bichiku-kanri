export default function StockpileGuideLink() {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-3 text-sm dark:border-white/10 dark:bg-black/20">
      <p className="font-medium">📋 何を備蓄すればいいか分からない方へ</p>
      <p className="mt-1 text-black/60 dark:text-white/60">
        まずは政府（首相官邸）の備蓄チェックリストが参考になります。
      </p>
      <a
        href="https://www.kantei.go.jp/jp/headline/bousai/sonae.html"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-medium text-blue-600 underline"
      >
        首相官邸「災害が起きる前にできること」を見る →
      </a>
      <p className="mt-2 text-xs text-black/50 dark:text-white/50">
        必要な備蓄は地域やハザード（地震・水害など）によって変わります。お住まいの市区町村の防災ページもあわせて確認してください。
      </p>
    </div>
  );
}
